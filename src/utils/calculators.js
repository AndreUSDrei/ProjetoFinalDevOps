/**
 * Valorant Manager Engine - Calculators & Business Rules
 * Fórmulas matemáticas e regras oficiais VCT Riot Games
 */

/**
 * Fórmula 1: Cálculo de Overall Individual (1-99)
 * Média ponderada com peso maior em MEC (25%) e IQ (25%)
 *
 * @param {Object} stats - Atributos { MEC, IQ, UTI, ENT, FLE, MEN }
 * @returns {number} BaseOverall arredondado (1-99)
 */
export const calculateOverall = (stats) => {
	if (!stats) return 50;

	const {
		MEC = 50,
		IQ = 50,
		UTI = 50,
		ENT = 50,
		FLE = 50,
		MEN = 50,
	} = stats;

	const weightedSum =
		MEC * 0.25 +
		IQ * 0.25 +
		UTI * 0.15 +
		ENT * 0.15 +
		FLE * 0.10 +
		MEN * 0.10;

	const overall = Math.round(weightedSum);
	return Math.min(99, Math.max(1, overall));
};

/**
 * Fórmula 2: Penalidade de Role Swap
 * Se o jogador for escalado fora da sua Role Principal e Secundária.
 * Quanto maior a Flexibilidade (FLE), menor a penalidade sofrida.
 *
 * @param {Object} player - Objeto do jogador
 * @param {string} assignedRole - Posição onde foi escalado
 * @returns {number} EffectiveOverall com penalidade aplicada
 */
export const calculateEffectiveOverall = (player, assignedRole) => {
	if (!player) return 0;

	const stats = player.stats || {};
	const baseOverall = player.overall || calculateOverall(stats);

	if (!assignedRole) return baseOverall;

	const isPrimary = player.primaryRole?.toLowerCase() === assignedRole.toLowerCase();
	const isSecondary = player.secondaryRole?.toLowerCase() === assignedRole.toLowerCase();

	// Se estiver jogando na role principal ou secundária, não há penalidade
	if (isPrimary || isSecondary) {
		return baseOverall;
	}

	// Flex (Coringa) pode atuar no slot Flex sem penalidade
	if (assignedRole.toLowerCase() === 'flex') {
		return baseOverall;
	}

	// Fórmula: PenaltyMultiplier = (100 - FLE) * 0.003
	const fle = stats.FLE || 70;
	const penaltyMultiplier = (100 - fle) * 0.003;
	const effectiveOverall = Math.round(baseOverall * (1 - penaltyMultiplier));

	return Math.min(99, Math.max(1, effectiveOverall));
};

/**
 * Fórmula 4: Custo de Transferência (Market Value)
 * Baseado exponencialmente no Overall e ajustado pelo fator de idade
 *
 * @param {number} overall - Overall do atleta
 * @param {number} age - Idade do atleta
 * @returns {number} Valor de mercado em dólares (USD)
 */
export const calculateMarketValue = (overall, age = 22) => {
	if (!overall || overall < 1) return 100000;

	// Base exponencial calibrada com o teto salarial do VCT (PRD Seção 3.2 e 6)
	// Jogadores Top Tier (~94 OVR) giram em torno de $2.5M a $3.2M
	const baseValue = Math.pow(overall, 3.2) * 1.35;
	const ageFactor = age < 21 ? 1.4 : age > 26 ? 0.75 : 1.0;

	// Arredondamento para múltiplos de 10.000 para clareza comercial
	const rawValue = baseValue * ageFactor;
	return Math.round(rawValue / 10000) * 10000;
};

/**
 * Checa se um atleta é considerado Import em relação à organização
 *
 * @param {string} playerRegion - Região do atleta (ex: "Americas", "EMEA", "Pacific", "China")
 * @param {string} teamRegion - Região da equipe
 * @returns {boolean} True se for importado
 */
export const isPlayerImport = (playerRegion, teamRegion) => {
	if (!playerRegion || !teamRegion) return false;
	return playerRegion.toLowerCase() !== teamRegion.toLowerCase();
};

/**
 * Conta quantos jogadores importados existem em uma escalação
 *
 * @param {Array} lineup - Lista de atletas titulares
 * @param {string} teamRegion - Região da organização
 * @returns {number} Quantidade de imports
 */
export const countImports = (lineup = [], teamRegion = '') => {
	if (!teamRegion || !Array.isArray(lineup)) return 0;
	return lineup.filter((p) => isPlayerImport(p?.region, teamRegion)).length;
};

/**
 * Regra Oficial Riot Games: Trava de Importação (Import Rule)
 * Cada escalação titular (5 titulares) só pode conter no MÁXIMO 1 jogador importado.
 *
 * @param {Array} currentLineup - Quinteto atual de titulares
 * @param {Object} candidatePlayer - Jogador que se quer contratar ou escalar
 * @param {string} teamRegion - Região da organização
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImportRule = (currentLineup = [], candidatePlayer, teamRegion) => {
	if (!candidatePlayer || !teamRegion) {
		return { valid: true };
	}

	const isCandidateImport = isPlayerImport(candidatePlayer.region, teamRegion);
	if (!isCandidateImport) {
		return { valid: true };
	}

	// Conta quantos imports já estão no time titular (desconsiderando o próprio jogador caso já esteja)
	const otherStarters = currentLineup.filter((p) => p && p.id !== candidatePlayer.id);
	const existingImports = countImports(otherStarters, teamRegion);

	if (existingImports >= 1) {
		return {
			valid: false,
			error: '[RULE VIOLATION] Maximum 1 Import Player allowed in Active Lineup',
		};
	}

	return { valid: true };
};

/**
 * Fórmula 3: Buff de IGL (Liderança e Sinergia Coletiva)
 * Se houver pelo menos 1 jogador com a tag isIGL: true:
 * - Buff de +4 pontos no Mental (MEN) coletivo
 * Se não houver IGL:
 * - Penalidade de -5 no QI Coletivo em clutches
 *
 * @param {Array} activeLineup - Quinteto titular
 * @returns {Object} Sinergia calculada
 */
export const calculateTeamSynergy = (activeLineup = []) => {
	const iglCount = (activeLineup || []).filter((p) => p?.isIGL).length;
	const hasIGL = iglCount > 0;

	return {
		hasIGL,
		iglCount,
		menBonus: hasIGL ? 4 : 0,
		iqPenalty: hasIGL ? 0 : -5,
		statusText: hasIGL
			? `IGL Presente (+4 Sinergia Mental)`
			: `Sem IGL Titular (-5 QI Coletivo em Clutches)`,
	};
};

/**
 * Validação Tática Oficial do VCT (PRD Seção 3.1 Item 3)
 * A composição obrigatória exige ao menos 1 Duelista, 1 Iniciador, 1 Controlador e 1 Sentinela.
 * A 5ª vaga é livre (Flex).
 *
 * @param {Array} starters - Lista de titulares (objetos ou com suas roles)
 * @returns {Object} { valid, missingRoles, counts, statusText }
 */
export const validateTacticalComposition = (starters = []) => {
	const requiredRoles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
	const counts = {
		Duelist: 0,
		Initiator: 0,
		Controller: 0,
		Sentinel: 0,
		Flex: 0,
	};

	starters.forEach((player) => {
		if (!player) return;
		const role = player.primaryRole || 'Flex';
		if (counts[role] !== undefined) {
			counts[role] += 1;
		} else {
			counts.Flex += 1;
		}
	});

	const missingRoles = requiredRoles.filter((role) => counts[role] === 0);
	const isFull = starters.length === 5;
	const valid = isFull && missingRoles.length === 0;

	let statusText = 'Composição Tática Balanceada';
	if (starters.length < 5) {
		statusText = `Elenco Incompleto (${starters.length}/5 Titulares)`;
	} else if (missingRoles.length > 0) {
		statusText = `Falta função tática: ${missingRoles.join(', ')}`;
	}

	return {
		valid,
		isFull,
		missingRoles,
		counts,
		statusText,
	};
};

/**
 * Cálculo Coletivo do Quinteto Titular (Team Rating Engine)
 * Calcula o Team Overall, penalidades por Role Swap, IGL Buff e validação geral
 *
 * @param {Array} starters - Lista com até 5 titulares
 * @param {Object} slotAssignments - Mapeamento { duelist: playerId, initiator: playerId, ... }
 * @param {string} teamRegion - Região do time
 * @returns {Object}
 */
export const calculateSquadStats = (starters = [], slotAssignments = {}, teamRegion = '') => {
	if (!Array.isArray(starters) || starters.length === 0) {
		return {
			teamOverall: 0,
			baseAverage: 0,
			effectivePlayers: [],
			totalPenalties: 0,
			synergy: calculateTeamSynergy([]),
			composition: validateTacticalComposition([]),
			importCount: 0,
			hasImportViolation: false,
		};
	}

	const roleKeys = ['duelist', 'initiator', 'controller', 'sentinel', 'flex'];
	const roleNames = {
		duelist: 'Duelist',
		initiator: 'Initiator',
		controller: 'Controller',
		sentinel: 'Sentinel',
		flex: 'Flex',
	};

	let totalEffective = 0;
	let totalBase = 0;
	let totalPenalties = 0;

	const effectivePlayers = starters.map((player) => {
		const baseOvr = player.overall || calculateOverall(player.stats);
		totalBase += baseOvr;

		// Acha em qual slot tático este jogador foi escalado
		let assignedSlot = 'flex';
		for (const key of roleKeys) {
			if (slotAssignments[key] === player.id) {
				assignedSlot = key;
				break;
			}
		}

		const assignedRole = roleNames[assignedSlot] || 'Flex';
		const effectiveOvr = calculateEffectiveOverall(player, assignedRole);
		const penalty = baseOvr - effectiveOvr;

		if (penalty > 0) totalPenalties += penalty;
		totalEffective += effectiveOvr;

		return {
			...player,
			assignedSlot,
			assignedRole,
			baseOverall: baseOvr,
			effectiveOverall: effectiveOvr,
			penalty,
			isRoleSwapped: penalty > 0,
		};
	});

	const starterCount = starters.length;
	const baseAverage = Math.round(totalBase / starterCount);
	let teamOverall = Math.round(totalEffective / starterCount);

	// Buff de IGL no overall se houver líder
	const synergy = calculateTeamSynergy(starters);
	if (synergy.hasIGL) {
		teamOverall = Math.min(99, teamOverall + 1); // +1 bônus visual de liderança
	}

	const composition = validateTacticalComposition(starters);
	const importCount = countImports(starters, teamRegion);
	const hasImportViolation = importCount > 1;

	return {
		teamOverall,
		baseAverage,
		effectivePlayers,
		totalPenalties,
		synergy,
		composition,
		importCount,
		hasImportViolation,
	};
};
