import {
	calculateOverall,
	calculateTeamSynergy,
	validateTacticalComposition,
	countImports,
} from './calculators.js';
import { getMap } from './maps.js';

// PRNG determinístico (mulberry32) para replays reproduzíveis por seed.
const mulberry32 = (seed) => {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const jitter = (rng, pt, amt = 1.6) => ({
	x: clamp(pt.x + (rng() - 0.5) * amt * 2, 1, 19),
	y: clamp(pt.y + (rng() - 0.5) * amt * 2, 1, 19),
});

const combatRating = (p) => {
	const s = p.stats || {};
	return (s.MEC || 50) * 0.45 + (s.ENT || 50) * 0.3 + (s.IQ || 50) * 0.15 + (s.UTI || 50) * 0.1;
};

const vulnerability = (p) => {
	const s = p.stats || {};
	return 120 - ((s.IQ || 50) * 0.4 + (s.MEN || 50) * 0.3 + (s.FLE || 50) * 0.3);
};

const weightedPick = (rng, arr, weightFn) => {
	const total = arr.reduce((sum, item) => sum + Math.max(1, weightFn(item)), 0);
	let roll = rng() * total;
	for (const item of arr) {
		roll -= Math.max(1, weightFn(item));
		if (roll <= 0) return item;
	}
	return arr[arr.length - 1];
};

// Força coletiva do quinteto: overall médio + sinergia IGL - faltas táticas - excesso de imports.
export const teamStrength = (team) => {
	const starters = team.starters || [];
	if (starters.length === 0) return 50;
	const base = starters.reduce((s, p) => s + (p.overall || calculateOverall(p.stats)), 0) / starters.length;
	const synergy = calculateTeamSynergy(starters);
	const composition = validateTacticalComposition(starters);
	const imports = countImports(starters, team.region);
	return (
		base +
		synergy.menBonus * 0.25 +
		synergy.iqPenalty * 0.25 -
		composition.missingRoles.length * 2 -
		(imports > 1 ? 3 : 0)
	);
};

const emptyStats = () => ({ kills: 0, deaths: 0, firstBloods: 0, plants: 0, defuses: 0, clutches: 0 });

// Gera o caminho (waypoints com tempo normalizado 0..1) de um jogador no round.
const buildPath = (rng, from, via, to, deathT) => {
	const pts = [
		{ t: 0, ...jitter(rng, from, 1.2) },
		{ t: 0.3, ...jitter(rng, via) },
		{ t: 0.62, ...jitter(rng, to) },
		{ t: 1, ...jitter(rng, to, 0.8) },
	];
	if (deathT != null) {
		// Congela o jogador no ponto onde morreu.
		const pos = positionAt(pts, deathT);
		return [...pts.filter((p) => p.t < deathT), { t: deathT, ...pos }, { t: 1, ...pos, dead: true }];
	}
	return pts;
};

const buildRoutePath = (rng, points, deathT) => {
	const pts = points.map((p, i) => ({
		t: points.length === 1 ? 0 : i / (points.length - 1),
		...jitter(rng, p, i === 0 || i === points.length - 1 ? 0.8 : 1.2),
	}));
	if (deathT != null) {
		const pos = positionAt(pts, deathT);
		return [...pts.filter((p) => p.t < deathT), { t: deathT, ...pos }, { t: 1, ...pos, dead: true }];
	}
	return pts;
};

export const positionAt = (path, t) => {
	if (!path || path.length === 0) return { x: 10, y: 10 };
	if (t <= path[0].t) return path[0];
	for (let i = 1; i < path.length; i++) {
		if (t <= path[i].t) {
			const a = path[i - 1];
			const b = path[i];
			const span = b.t - a.t || 1;
			const k = (t - a.t) / span;
			return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
		}
	}
	return path[path.length - 1];
};

export const simulateMatch = ({ teamA, teamB, mapId = 'ascent', seed = Date.now() }) => {
	const rng = mulberry32(seed);
	const map = getMap(mapId);
	const sA = teamStrength(teamA);
	const sB = teamStrength(teamB);

	const lineupA = (teamA.starters || []).slice(0, 5);
	const lineupB = (teamB.starters || []).slice(0, 5);
	const byId = {};
	lineupA.forEach((p) => (byId[p.id] = { ...p, side: 'A' }));
	lineupB.forEach((p) => (byId[p.id] = { ...p, side: 'B' }));

	const playerStats = {};
	Object.keys(byId).forEach((id) => (playerStats[id] = emptyStats()));

	const rounds = [];
	let scoreA = 0;
	let scoreB = 0;
	let roundNumber = 1;

	const sigmoid = (d) => 1 / (1 + Math.exp(-d / 6));

	while (roundNumber <= 40) {
		const attacker = roundNumber <= 24 ? (roundNumber <= 12 ? 'A' : 'B') : roundNumber % 2 === 1 ? 'A' : 'B';
		const defender = attacker === 'A' ? 'B' : 'A';
		const pWinA = clamp(sigmoid(sA - sB) + (attacker === 'A' ? 0.02 : -0.02), 0.08, 0.92);
		const winner = rng() < pWinA ? 'A' : 'B';
		const loser = winner === 'A' ? 'B' : 'A';

		const targetSite = rng() < 0.5 ? map.siteA : map.siteB;
		const siteKey = targetSite === map.siteA ? 'A' : 'B';
		const attLineup = attacker === 'A' ? lineupA : lineupB;
		const defLineup = defender === 'A' ? lineupA : lineupB;

		const alive = { A: [...lineupA], B: [...lineupB] };
		const deathT = {};
		const events = [];
		let t = 0.34;
		let firstBloodDone = false;
		let planted = false;
		let planter = null;

		// Sequência de trocas de tiro até um lado ser eliminado ou o tempo acabar.
		while (alive.A.length > 0 && alive.B.length > 0 && t < 0.86) {
			const winnerGetsKill = rng() < 0.68;
			const shooterSide = winnerGetsKill ? winner : loser;
			const targetSide = shooterSide === 'A' ? 'B' : 'A';
			if (alive[shooterSide].length === 0 || alive[targetSide].length === 0) break;
			const shooter = weightedPick(rng, alive[shooterSide], combatRating);
			const target = weightedPick(rng, alive[targetSide], vulnerability);
			alive[targetSide] = alive[targetSide].filter((p) => p.id !== target.id);
			deathT[target.id] = t;
			playerStats[shooter.id].kills += 1;
			playerStats[target.id].deaths += 1;
			if (!firstBloodDone) {
				playerStats[shooter.id].firstBloods += 1;
				firstBloodDone = true;
			}
			events.push({
				t,
				type: 'kill',
				actorId: shooter.id,
				targetId: target.id,
				actorNick: shooter.nickname,
				targetNick: target.nickname,
				side: shooterSide,
			});
			t += 0.05 + rng() * 0.09;
		}

		// Plant da spike se o atacante chegou vivo ao site.
		const attAlive = alive[attacker];
		if (attAlive.length > 0 && t >= 0.5) {
			planted = true;
			planter = pick(rng, attAlive);
			playerStats[planter.id].plants += 1;
			events.push({ t: Math.max(0.6, t - 0.1), type: 'plant', actorId: planter.id, actorNick: planter.nickname, side: attacker });
		}

		// Desfecho do round.
		let reason;
		if (alive[loser].length === 0) {
			reason = planted && winner === attacker ? 'detonate' : 'elimination';
		} else if (alive[winner].length === 0) {
			reason = 'elimination';
		} else {
			reason = winner === attacker ? (planted ? 'detonate' : 'time') : planted ? 'defuse' : 'time';
		}
		if (reason === 'detonate') events.push({ t: 0.95, type: 'detonate', side: attacker });
		if (reason === 'defuse' && alive[defender].length > 0) {
			const defuser = pick(rng, alive[defender]);
			playerStats[defuser.id].defuses += 1;
			events.push({ t: 0.95, type: 'defuse', actorId: defuser.id, actorNick: defuser.nickname, side: defender });
		}
		// Clutch: último sobrevivente do vencedor fechou o round sozinho.
		if (alive[winner].length === 1) playerStats[alive[winner][0].id].clutches += 1;

		events.push({ t: 1, type: 'roundEnd', winner, reason });
		events.sort((a, b) => a.t - b.t);

		// Caminhos de movimento para o replay isométrico.
		const moves = {};
		lineupA.concat(lineupB).forEach((p, idx) => {
			const isAtt = byId[p.id].side === attacker;
			if (map.routes) {
				const route = isAtt
					? siteKey === 'A'
						? rng() < 0.35
							? map.routes.midA
							: map.routes.A
						: rng() < 0.35
							? map.routes.midB
							: map.routes.B
					: idx % 2 === 0
						? map.routes.defA
						: map.routes.defB;
				moves[p.id] = buildRoutePath(rng, route, deathT[p.id]);
				return;
			}
			const from = isAtt ? map.spawnAtt : map.spawnDef;
			const via = map.mid;
			const to = isAtt ? targetSite : idx % 2 === 0 ? map.siteA : map.siteB;
			moves[p.id] = buildPath(rng, from, via, to, deathT[p.id]);
		});

		if (winner === 'A') scoreA += 1;
		else scoreB += 1;

		rounds.push({
			number: roundNumber,
			winner,
			attacker,
			site: siteKey,
			events,
			moves,
			scoreA,
			scoreB,
		});

		const reachedRegulation = (scoreA >= 13 || scoreB >= 13) && !(scoreA >= 12 && scoreB >= 12);
		const overtime = roundNumber >= 25;
		const otWin = overtime && (scoreA >= 14 || scoreB >= 14) && Math.abs(scoreA - scoreB) >= 2;
		const safety = roundNumber >= 34;
		if (reachedRegulation || otWin || safety) break;
		roundNumber += 1;
	}

	const winner = scoreA > scoreB ? 'A' : 'B';
	const winnerTeam = winner === 'A' ? teamA : teamB;
	let mvpId = null;
	let mvpScore = -1;
	Object.entries(playerStats).forEach(([id, st]) => {
		const score = st.kills * 2 + st.firstBloods + st.clutches * 2 + st.plants + st.defuses - st.deaths * 0.5;
		if (score > mvpScore) {
			mvpScore = score;
			mvpId = id;
		}
	});

	return {
		id: `m${seed}`,
		mapId: map.id,
		mapName: map.name,
		seed,
		teamA: { name: teamA.name, color: teamA.color || '#ff4655', region: teamA.region, players: lineupA },
		teamB: { name: teamB.name, color: teamB.color || '#38bdf8', region: teamB.region, players: lineupB },
		strengthA: Math.round(sA),
		strengthB: Math.round(sB),
		rounds,
		scoreA,
		scoreB,
		winner,
		winnerName: winnerTeam.name,
		mvp: mvpId ? { ...byId[mvpId], stats: playerStats[mvpId] } : null,
		playerStats,
	};
};

// Evolução pós-partida: jovens (<20) evoluem 3x mais rápido, respeitando o teto de potential.
export const applyProgression = (players, playerStats, rng = Math.random) => {
	const changes = [];
	const updated = players.map((p) => {
		const overall = p.overall || calculateOverall(p.stats);
		const headroom = (p.potential || overall) - overall;
		if (headroom <= 0) return p;
		const factor = p.age < 20 ? 3 : p.age < 23 ? 2 : 1;
		const perf = playerStats?.[p.id]?.kills || 0;
		const chance = clamp(0.12 * factor + perf * 0.02, 0, 0.85);
		if (rng() >= chance) return p;

		const stats = { ...p.stats };
		const keys = Object.keys(stats);
		const bumps = headroom >= 2 && rng() < 0.4 ? 2 : 1;
		for (let i = 0; i < bumps; i++) {
			const k = pick(rng, keys);
			stats[k] = clamp(stats[k] + 1, 1, 99);
		}
		const newOverall = Math.min(p.potential || 99, calculateOverall(stats));
		if (newOverall <= overall) return p;
		changes.push({ id: p.id, nickname: p.nickname, from: overall, to: newOverall });
		return { ...p, stats, overall: newOverall };
	});
	return { players: updated, changes };
};