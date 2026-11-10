import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import initialPlayers from '../data/players.json';
import fallbackOrganizations from '../data/teams.json';
import {
	calculateOverall,
	validateImportRule,
	calculateSquadStats,
	validateTacticalComposition,
} from '../utils/calculators';
import { applyProgression } from '../utils/matchEngine';
import { api, LOCAL_SAVE_KEY, SAVE_SLOT, serializeManager, withManagerGetters } from '../api/client';

const GameContext = createContext(null);

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

// Helper to auto-assign starters to tactical slots
const computeOptimalSlots = (starters = []) => {
	const slots = {
		duelist: null,
		initiator: null,
		controller: null,
		sentinel: null,
		flex: null,
	};

	const unassigned = [...starters];
	const roles = ['duelist', 'initiator', 'controller', 'sentinel'];

	// 1st pass: match primary roles exactly
	roles.forEach((slotKey) => {
		const idx = unassigned.findIndex(
			(p) => p.primaryRole?.toLowerCase() === slotKey
		);
		if (idx !== -1) {
			slots[slotKey] = unassigned[idx].id;
			unassigned.splice(idx, 1);
		}
	});

	// 2nd pass: match secondary roles for empty slots
	roles.forEach((slotKey) => {
		if (!slots[slotKey]) {
			const idx = unassigned.findIndex(
				(p) => p.secondaryRole?.toLowerCase() === slotKey
			);
			if (idx !== -1) {
				slots[slotKey] = unassigned[idx].id;
				unassigned.splice(idx, 1);
			}
		}
	});

	// 3rd pass: fill remaining empty core slots with remaining players
	roles.forEach((slotKey) => {
		if (!slots[slotKey] && unassigned.length > 0) {
			slots[slotKey] = unassigned[0].id;
			unassigned.shift();
		}
	});

	// 4th pass: assign whoever is left to the Flex slot
	if (unassigned.length > 0) {
		slots.flex = unassigned[0].id;
	}

	return slots;
};

export const GameProvider = ({ children }) => {
	// Game States: 'SETUP' | 'SELECT_ORG' | 'DASHBOARD'
	const [gameState, setGameState] = useState('SETUP');

	// Active Tab inside Dashboard: 'overview' | 'transfers' | 'squad'
	const [currentView, setCurrentView] = useState('overview');

	// Perfil do Treinador / General Manager
	const [manager, setManager] = useState({
		managerName: '',
		country: '',
		reputation: 'Promessa Regional',
		get name() {
			return this.managerName;
		},
		get origin() {
			return this.country;
		},
	});

	// Selected Franchise / Organization
	const [organization, setOrganization] = useState(null);

	// Available balance / Transfer budget
	const [budget, setBudget] = useState(0);

	// Histórico de partidas simuladas
	const [matchHistory, setMatchHistory] = useState([]);

	// Global list of players in the transfer market & world
	const [marketPlayers, setMarketPlayers] = useState(() =>
		initialPlayers.map((p) => ({
			...p,
			overall: p.overall || calculateOverall(p.stats),
		}))
	);

	// Active Roster (Starting 5 + up to 2 Substitutes)
	const [roster, setRoster] = useState({
		starters: [],
		substitutes: [],
	});

	// Tactical Slot assignments for the 5 starters: { duelist, initiator, controller, sentinel, flex }
	const [tacticalSlots, setTacticalSlots] = useState({
		duelist: null,
		initiator: null,
		controller: null,
		sentinel: null,
		flex: null,
	});

	const [organizations, setOrganizations] = useState(fallbackOrganizations);
	const [hydrated, setHydrated] = useState(false);
	const skipNextPersist = useRef(true);

	// Select organization, load its real players from the database and set budget
	const handleSelectOrganization = (org) => {
		setOrganization(org);
		setBudget(org?.budget || 0);

		if (!org) {
			setRoster({ starters: [], substitutes: [] });
			setTacticalSlots({
				duelist: null,
				initiator: null,
				controller: null,
				sentinel: null,
				flex: null,
			});
			return;
		}

		// Procura atletas que já possuem contrato com esta organização na Liquipedia
		const orgPlayers = marketPlayers.filter(
			(p) => p.currentTeam && p.currentTeam.toLowerCase() === org.name.toLowerCase()
		);

		const starters = orgPlayers.slice(0, 5);
		const substitutes = orgPlayers.slice(5, 7);

		setRoster({
			starters,
			substitutes,
		});

		// Auto-atribui os 5 titulares aos slots táticos
		const optimalSlots = computeOptimalSlots(starters);
		setTacticalSlots(optimalSlots);
	};

	/**
	 * Atribui manualmente um jogador a um slot tático específico
	 */
	const assignSlot = (slotKey, playerId) => {
		setTacticalSlots((prev) => {
			const nextSlots = { ...prev };

			// Se este jogador já estava em outro slot, remove-o de lá
			Object.keys(nextSlots).forEach((k) => {
				if (nextSlots[k] === playerId) {
					nextSlots[k] = null;
				}
			});

			// Atribui ao slot desejado
			nextSlots[slotKey] = playerId;
			return nextSlots;
		});
	};

	/**
	 * Auto-organiza os titulares em seus melhores slots
	 */
	const autoOptimizeSlots = () => {
		const optimal = computeOptimalSlots(roster.starters);
		setTacticalSlots(optimal);
	};

	/**
	 * Alterna / Define o IGL da equipe
	 */
	const setPlayerAsIGL = (playerId) => {
		setRoster((prev) => ({
			...prev,
			starters: prev.starters.map((p) => ({
				...p,
				isIGL: p.id === playerId,
			})),
			substitutes: prev.substitutes.map((p) => ({
				...p,
				isIGL: p.id === playerId,
			})),
		}));
	};

	/**
	 * Contratação de Jogador (Buy Player)
	 */
	const buyPlayer = (player) => {
		if (!organization) {
			return { success: false, message: 'Nenhuma organização selecionada.' };
		}

		const isAlreadyInTeam =
			roster.starters.some((p) => p.id === player.id) ||
			roster.substitutes.some((p) => p.id === player.id);

		if (isAlreadyInTeam) {
			return { success: false, message: `${player.nickname} já faz parte do seu elenco.` };
		}

		const totalPlayers = roster.starters.length + roster.substitutes.length;
		if (totalPlayers >= 7) {
			return {
				success: false,
				message: 'Elenco cheio! O VCT permite no máximo 5 titulares e 2 reservas (7 atletas).',
			};
		}

		const cost = player.marketValue || 0;
		if (budget < cost) {
			return {
				success: false,
				message: `Saldo insuficiente! Você tem $${budget.toLocaleString()} e precisa de $${cost.toLocaleString()}.`,
			};
		}

		const hasStarterSpot = roster.starters.length < 5;

		if (hasStarterSpot) {
			const importValidation = validateImportRule(roster.starters, player, organization.region);
			if (!importValidation.valid) {
				if (roster.substitutes.length < 2) {
					setBudget((prev) => prev - cost);
					setRoster((prev) => ({
						...prev,
						substitutes: [...prev.substitutes, { ...player, currentTeam: organization.name }],
					}));
					setMarketPlayers((prev) =>
						prev.map((p) => (p.id === player.id ? { ...p, currentTeam: organization.name } : p))
					);
					return {
						success: true,
						message: `${player.nickname} foi contratado como RESERVA devido à regra de limite de 1 Import no quinteto titular.`,
					};
				}

				return {
					success: false,
					message: importValidation.error,
				};
			}

			const updatedStarters = [...roster.starters, { ...player, currentTeam: organization.name }];
			setBudget((prev) => prev - cost);
			setRoster((prev) => ({
				...prev,
				starters: updatedStarters,
			}));

			// Auto-atualiza os slots com o novo titular
			setTacticalSlots(computeOptimalSlots(updatedStarters));
		} else {
			setBudget((prev) => prev - cost);
			setRoster((prev) => ({
				...prev,
				substitutes: [...prev.substitutes, { ...player, currentTeam: organization.name }],
			}));
		}

		setMarketPlayers((prev) =>
			prev.map((p) => (p.id === player.id ? { ...p, currentTeam: organization.name } : p))
		);

		return {
			success: true,
			message: `Contratação de ${player.nickname} finalizada com sucesso!`,
		};
	};

	/**
	 * Venda de Jogador (Sell Player)
	 */
	const sellPlayer = (playerId) => {
		const targetPlayer =
			roster.starters.find((p) => p.id === playerId) ||
			roster.substitutes.find((p) => p.id === playerId);

		if (!targetPlayer) {
			return { success: false, message: 'Jogador não encontrado no seu elenco.' };
		}

		const refundValue = Math.round((targetPlayer.marketValue || 0) * 0.75);

		const updatedStarters = roster.starters.filter((p) => p.id !== playerId);
		setRoster((prev) => ({
			starters: updatedStarters,
			substitutes: prev.substitutes.filter((p) => p.id !== playerId),
		}));

		// Limpa o slot se o jogador vendido estava escalado
		setTacticalSlots((prev) => {
			const nextSlots = { ...prev };
			Object.keys(nextSlots).forEach((k) => {
				if (nextSlots[k] === playerId) nextSlots[k] = null;
			});
			return nextSlots;
		});

		setBudget((prev) => prev + refundValue);

		setMarketPlayers((prev) =>
			prev.map((p) => (p.id === playerId ? { ...p, currentTeam: 'Free Agent' } : p))
		);

		return {
			success: true,
			message: `${targetPlayer.nickname} foi negociado por $${refundValue.toLocaleString()} e agora está como Free Agent.`,
		};
	};

	/**
	 * Rescisão de Contrato (Release Player)
	 */
	const releasePlayer = (playerId) => {
		const targetPlayer =
			roster.starters.find((p) => p.id === playerId) ||
			roster.substitutes.find((p) => p.id === playerId);

		if (!targetPlayer) {
			return { success: false, message: 'Jogador não encontrado no elenco.' };
		}

		const updatedStarters = roster.starters.filter((p) => p.id !== playerId);
		setRoster((prev) => ({
			starters: updatedStarters,
			substitutes: prev.substitutes.filter((p) => p.id !== playerId),
		}));

		setTacticalSlots((prev) => {
			const nextSlots = { ...prev };
			Object.keys(nextSlots).forEach((k) => {
				if (nextSlots[k] === playerId) nextSlots[k] = null;
			});
			return nextSlots;
		});

		setMarketPlayers((prev) =>
			prev.map((p) => (p.id === playerId ? { ...p, currentTeam: 'Free Agent' } : p))
		);

		return {
			success: true,
			message: `Contrato de ${targetPlayer.nickname} rescindido amigavelmente.`,
		};
	};

	/**
	 * Troca de posição entre Titular e Reserva
	 */
	const swapStarterSub = (starterId, subId) => {
		const starter = roster.starters.find((p) => p.id === starterId);
		const sub = roster.substitutes.find((p) => p.id === subId);

		if (!starter || !sub) return { success: false, message: 'Jogadores inválidos.' };

		// Valida se a promoção do reserva violaria a regra de Import
		const newStarters = roster.starters.filter((p) => p.id !== starterId);
		const importValidation = validateImportRule(newStarters, sub, organization.region);

		if (!importValidation.valid) {
			return {
				success: false,
				message: importValidation.error,
			};
		}

		const updatedStarters = [...newStarters, sub];
		const updatedSubs = [...roster.substitutes.filter((p) => p.id !== subId), starter];

		setRoster({
			starters: updatedStarters,
			substitutes: updatedSubs,
		});

		// Substitui o jogador no slot tático
		setTacticalSlots((prev) => {
			const nextSlots = { ...prev };
			Object.keys(nextSlots).forEach((k) => {
				if (nextSlots[k] === starterId) {
					nextSlots[k] = subId;
				}
			});
			return nextSlots;
		});

		return { success: true, message: `${sub.nickname} assumiu a vaga de ${starter.nickname}!` };
	};

	/**
	 * Registra o resultado de uma partida simulada e aplica a evolução de jovens ao elenco.
	 */
	const recordMatchResult = (result) => {
		setMatchHistory((prev) => [
			{
				id: result.id,
				mapName: result.mapName,
				teamAName: result.teamA.name,
				teamBName: result.teamB.name,
				scoreA: result.scoreA,
				scoreB: result.scoreB,
				winnerName: result.winnerName,
				mvpNick: result.mvp?.nickname || null,
				at: Date.now(),
			},
			...prev,
		]);

		const allRoster = [...roster.starters, ...roster.substitutes];
		const { players: updated, changes } = applyProgression(allRoster, result.playerStats);
		setRoster({
			starters: updated.slice(0, roster.starters.length),
			substitutes: updated.slice(roster.starters.length),
		});
		setMarketPlayers((prev) =>
			prev.map((p) => {
				const u = updated.find((x) => x.id === p.id);
				return u ? { ...p, stats: u.stats, overall: u.overall } : p;
			})
		);
		return changes;
	};

	// Squad Stats calculados em tempo real (Overall coletivo, sinergias, penalidades)
	const squadStats = useMemo(() => {
		return calculateSquadStats(roster.starters, tacticalSlots, organization?.region);
	}, [roster.starters, tacticalSlots, organization?.region]);

	const buildSavePayload = () => ({
		gameState,
		currentView,
		manager: serializeManager(manager),
		organization,
		budget,
		roster,
		tacticalSlots,
		marketPlayers,
		matchHistory,
	});

	const applySave = (payload) => {
		if (!payload || typeof payload !== 'object') return;
		if (payload.gameState) setGameState(payload.gameState);
		if (payload.currentView) setCurrentView(payload.currentView);
		if (payload.manager) setManager(withManagerGetters(payload.manager));
		if (payload.organization) setOrganization(payload.organization);
		if (typeof payload.budget === 'number') setBudget(payload.budget);
		if (payload.roster) setRoster(payload.roster);
		if (payload.tacticalSlots) setTacticalSlots(payload.tacticalSlots);
		if (Array.isArray(payload.marketPlayers) && payload.marketPlayers.length > 0) {
			setMarketPlayers(payload.marketPlayers);
		}
		if (Array.isArray(payload.matchHistory)) setMatchHistory(payload.matchHistory);
	};

	useEffect(() => {
		let cancelled = false;

		const hydrate = async () => {
			try {
				const [save, apiPlayers, apiOrgs] = await Promise.all([
					api.getSave(SAVE_SLOT).catch(() => null),
					api.getPlayers().catch(() => null),
					api.getOrganizations().catch(() => null),
				]);

				if (cancelled) return;

				if (Array.isArray(apiOrgs) && apiOrgs.length > 0) {
					setOrganizations(apiOrgs);
				}

				if (save?.payload) {
					applySave(save.payload);
				} else {
					const localRaw = localStorage.getItem(LOCAL_SAVE_KEY);
					if (localRaw) {
						applySave(JSON.parse(localRaw));
					} else if (Array.isArray(apiPlayers) && apiPlayers.length > 0) {
						setMarketPlayers(
							apiPlayers.map((p) => ({
								...p,
								overall: p.overall || calculateOverall(p.stats),
							}))
						);
					}
				}
			} catch {
				try {
					const localRaw = localStorage.getItem(LOCAL_SAVE_KEY);
					if (localRaw && !cancelled) applySave(JSON.parse(localRaw));
				} catch {
					/* ignore corrupt local save */
				}
			} finally {
				if (!cancelled) {
					skipNextPersist.current = true;
					setHydrated(true);
				}
			}
		};

		hydrate();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		if (skipNextPersist.current) {
			skipNextPersist.current = false;
			return;
		}

		const payload = buildSavePayload();
		try {
			localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(payload));
		} catch {
			/* quota / private mode */
		}

		const timer = setTimeout(() => {
			api.putSave(SAVE_SLOT, payload).catch(() => {});
		}, 400);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		hydrated,
		gameState,
		currentView,
		manager,
		organization,
		budget,
		roster,
		tacticalSlots,
		marketPlayers,
		matchHistory,
	]);

	// Reset Game
	const resetGame = () => {
		setGameState('SETUP');
		setCurrentView('overview');
		setOrganization(null);
		setBudget(0);
		setMatchHistory([]);
		setRoster({ starters: [], substitutes: [] });
		setTacticalSlots({
			duelist: null,
			initiator: null,
			controller: null,
			sentinel: null,
			flex: null,
		});
		setMarketPlayers(
			initialPlayers.map((p) => ({
				...p,
				overall: p.overall || calculateOverall(p.stats),
			}))
		);
		setManager(withManagerGetters({}));
		try {
			localStorage.removeItem(LOCAL_SAVE_KEY);
		} catch {
			/* ignore */
		}
		api.putSave(SAVE_SLOT, { gameState: 'SETUP' }).catch(() => {});
	};

	const value = {
		gameState,
		setGameState,
		currentView,
		setCurrentView,
		manager,
		setManager,
		organization,
		setOrganization: handleSelectOrganization,
		budget,
		setBudget,
		roster,
		setRoster,
		tacticalSlots,
		assignSlot,
		autoOptimizeSlots,
		setPlayerAsIGL,
		squadStats,
		marketPlayers,
		buyPlayer,
		sellPlayer,
		releasePlayer,
		swapStarterSub,
		matchHistory,
		recordMatchResult,
		resetGame,
		organizations,
		hydrated,
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
