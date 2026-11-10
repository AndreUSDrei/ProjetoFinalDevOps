import { describe, expect, it } from 'vitest';
import { simulateMatch, teamStrength } from './matchEngine.js';

const player = (id, overall, role) => ({
	id,
	nickname: id,
	overall,
	primaryRole: role,
	secondaryRole: 'Flex',
	region: 'Americas',
	isIGL: id === 'p1',
	stats: { MEC: overall, IQ: overall, UTI: overall, ENT: overall, FLE: overall, MEN: overall },
});

const squad = (name) => ({
	name,
	region: 'Americas',
	starters: [
		player(`${name}-1`, 80, 'Duelist'),
		player(`${name}-2`, 78, 'Initiator'),
		player(`${name}-3`, 77, 'Controller'),
		player(`${name}-4`, 76, 'Sentinel'),
		player(`${name}-5`, 75, 'Flex'),
	],
});

describe('teamStrength', () => {
	it('retorna 50 sem titulares', () => {
		expect(teamStrength({ starters: [] })).toBe(50);
	});

	it('sobe com overall médio do quinteto', () => {
		expect(teamStrength(squad('A'))).toBeGreaterThan(50);
	});
});

describe('simulateMatch', () => {
	it('é determinístico para a mesma seed', () => {
		const input = { teamA: squad('LOUD'), teamB: squad('NRG'), mapId: 'ascent', seed: 42 };
		const a = simulateMatch(input);
		const b = simulateMatch(input);
		expect(a.scoreA).toBe(b.scoreA);
		expect(a.scoreB).toBe(b.scoreB);
		expect(a.winnerName).toBe(b.winnerName);
		expect(a.rounds.length).toBe(b.rounds.length);
	});

	it('produz placar e MVP', () => {
		const result = simulateMatch({
			teamA: squad('LOUD'),
			teamB: squad('NRG'),
			mapId: 'ascent',
			seed: 7,
		});
		expect(result.scoreA + result.scoreB).toBeGreaterThan(12);
		expect(result.mvp).toBeTruthy();
	});
});
