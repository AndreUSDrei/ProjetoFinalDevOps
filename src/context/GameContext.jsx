import React, { createContext, useContext, useState, useEffect } from 'react';
import initialPlayers from '../data/players.json';
import { calculateOverall, validateImportRule } from '../utils/calculators';

const GameContext = createContext(null);

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

export const GameProvider = ({ children }) => {
	// Game States: 'SETUP' | 'SELECT_ORG' | 'DASHBOARD'
	const [gameState, setGameState] = useState('SETUP');

	// Active Tab inside Dashboard: 'overview' | 'transfers' | 'squad'
	const [currentView, setCurrentView] = useState('overview');

	// Default Head Coach / GM Profile (PRD section 2)
	const [manager, setManager] = useState({
		managerName: 'Andreus Vinícius Araújo de Andrade',
		originCity: 'Wanel Ville',
		coachLevel: 25,
		overallRating: 82,
		reputation: 'National Prospect',
		get name() {
			return this.managerName;
		},
		get origin() {
			return this.originCity;
		},
		get experience() {
			return `Nível ${this.coachLevel} (Overall ${this.overallRating})`;
		},
	});

	// Selected Franchise / Organization
	const [organization, setOrganization] = useState(null);

	// Available balance / Transfer budget
	const [budget, setBudget] = useState(0);

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

	// Select organization, load its real players from the database and set budget
	const handleSelectOrganization = (org) => {
		setOrganization(org);
		setBudget(org?.budget || 0);

		if (!org) {
			setRoster({ starters: [], substitutes: [] });
			return;
		}

		// Procura atletas que já possuem contrato com esta organização na Liquipedia
		const orgPlayers = marketPlayers.filter(
			(p) => p.currentTeam && p.currentTeam.toLowerCase() === org.name.toLowerCase()
		);

		// Atribui os 5 primeiros aos Titulares (Starters) e os demais a Reservas (Substitutes)
		const starters = orgPlayers.slice(0, 5);
		const substitutes = orgPlayers.slice(5, 7);

		setRoster({
			starters,
			substitutes,
		});
	};

	/**
	 * Contratação de Jogador (Buy Player)
	 * Valida orçamento, vagas no elenco e a regra de importação da Riot Games
	 */
	const buyPlayer = (player) => {
		if (!organization) {
			return { success: false, message: 'Nenhuma organização selecionada.' };
		}

		// Checa se o jogador já está no elenco
		const isAlreadyInTeam =
			roster.starters.some((p) => p.id === player.id) ||
			roster.substitutes.some((p) => p.id === player.id);

		if (isAlreadyInTeam) {
			return { success: false, message: `${player.nickname} já faz parte do seu elenco.` };
		}

		// Checa o limite do elenco: 5 Titulares + 2 Reservas (Total: 7)
		const totalPlayers = roster.starters.length + roster.substitutes.length;
		if (totalPlayers >= 7) {
			return {
				success: false,
				message: 'Elenco cheio! O VCT permite no máximo 5 titulares e 2 reservas (7 atletas).',
			};
		}

		// Checa saldo disponível
		const cost = player.marketValue || 0;
		if (budget < cost) {
			return {
				success: false,
				message: `Saldo insuficiente! Você tem $${budget.toLocaleString()} e precisa de $${cost.toLocaleString()}.`,
			};
		}

		// Decide se entra como titular (se houver vaga) ou reserva
		const hasStarterSpot = roster.starters.length < 5;

		if (hasStarterSpot) {
			// Valida a regra de 1 Import no quinteto titular
			const importValidation = validateImportRule(roster.starters, player, organization.region);
			if (!importValidation.valid) {
				// Se violar a regra de import nos titulares, verifica se há vaga no banco
				if (roster.substitutes.length < 2) {
					// Pode ser contratado como reserva
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

			// Adiciona aos titulares
			setBudget((prev) => prev - cost);
			setRoster((prev) => ({
				...prev,
				starters: [...prev.starters, { ...player, currentTeam: organization.name }],
			}));
		} else {
			// Adiciona aos reservas
			setBudget((prev) => prev - cost);
			setRoster((prev) => ({
				...prev,
				substitutes: [...prev.substitutes, { ...player, currentTeam: organization.name }],
			}));
		}

		// Atualiza o time atual do jogador no catálogo do mercado
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
	 * Remove do elenco, reembolsa 75% do valor ao saldo e libera o jogador como Free Agent
	 */
	const sellPlayer = (playerId) => {
		const targetPlayer =
			roster.starters.find((p) => p.id === playerId) ||
			roster.substitutes.find((p) => p.id === playerId);

		if (!targetPlayer) {
			return { success: false, message: 'Jogador não encontrado no seu elenco.' };
		}

		// Reembolso de transferência: 75% do Market Value
		const refundValue = Math.round((targetPlayer.marketValue || 0) * 0.75);

		// Remove do elenco
		setRoster((prev) => ({
			starters: prev.starters.filter((p) => p.id !== playerId),
			substitutes: prev.substitutes.filter((p) => p.id !== playerId),
		}));

		// Adiciona o valor estornado ao orçamento
		setBudget((prev) => prev + refundValue);

		// Marca o jogador como Free Agent no mercado
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
	 * Libera o atleta para Free Agent sem reembolso de taxa
	 */
	const releasePlayer = (playerId) => {
		const targetPlayer =
			roster.starters.find((p) => p.id === playerId) ||
			roster.substitutes.find((p) => p.id === playerId);

		if (!targetPlayer) {
			return { success: false, message: 'Jogador não encontrado no elenco.' };
		}

		setRoster((prev) => ({
			starters: prev.starters.filter((p) => p.id !== playerId),
			substitutes: prev.substitutes.filter((p) => p.id !== playerId),
		}));

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

		setRoster((prev) => ({
			starters: [...prev.starters.filter((p) => p.id !== starterId), sub],
			substitutes: [...prev.substitutes.filter((p) => p.id !== subId), starter],
		}));

		return { success: true, message: `Troca realizada com sucesso!` };
	};

	// Reset Game
	const resetGame = () => {
		setGameState('SETUP');
		setCurrentView('overview');
		setOrganization(null);
		setBudget(0);
		setRoster({ starters: [], substitutes: [] });
		setMarketPlayers(
			initialPlayers.map((p) => ({
				...p,
				overall: p.overall || calculateOverall(p.stats),
			}))
		);
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
		marketPlayers,
		buyPlayer,
		sellPlayer,
		releasePlayer,
		swapStarterSub,
		resetGame,
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
