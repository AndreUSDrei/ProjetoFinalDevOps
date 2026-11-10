import { describe, expect, it } from 'vitest';
import {
	calculateEffectiveOverall,
	calculateMarketValue,
	calculateOverall,
	countImports,
	isPlayerImport,
	validateImportRule,
	validateTacticalComposition,
} from './calculators.js';

describe('calculateOverall', () => {
	it('aplica pesos de MEC e IQ', () => {
		const overall = calculateOverall({
			MEC: 100,
			IQ: 100,
			UTI: 0,
			ENT: 0,
			FLE: 0,
			MEN: 0,
		});
		expect(overall).toBe(50);
	});

	it('usa 50 quando stats estão ausentes', () => {
		expect(calculateOverall(null)).toBe(50);
	});
});

describe('calculateEffectiveOverall', () => {
	const player = {
		primaryRole: 'Duelist',
		secondaryRole: 'Flex',
		overall: 80,
		stats: { FLE: 50, MEC: 80, IQ: 80, UTI: 80, ENT: 80, MEN: 80 },
	};

	it('não penaliza role principal', () => {
		expect(calculateEffectiveOverall(player, 'Duelist')).toBe(80);
	});

	it('penaliza role fora do perfil', () => {
		expect(calculateEffectiveOverall(player, 'Sentinel')).toBeLessThan(80);
	});
});

describe('import rule', () => {
	it('marca atleta de outra região como import', () => {
		expect(isPlayerImport('EMEA', 'Americas')).toBe(true);
		expect(isPlayerImport('Americas', 'Americas')).toBe(false);
	});

	it('bloqueia segundo import no quinteto', () => {
		const lineup = [{ id: 'a', region: 'EMEA' }];
		const result = validateImportRule(lineup, { id: 'b', region: 'Pacific' }, 'Americas');
		expect(result.valid).toBe(false);
	});

	it('conta imports na escalação', () => {
		expect(
			countImports(
				[
					{ region: 'Americas' },
					{ region: 'EMEA' },
					{ region: 'Americas' },
				],
				'Americas'
			)
		).toBe(1);
	});
});

describe('validateTacticalComposition', () => {
	it('detecta roles ausentes', () => {
		const result = validateTacticalComposition([
			{ primaryRole: 'Duelist' },
			{ primaryRole: 'Duelist' },
		]);
		expect(result.missingRoles.length).toBeGreaterThan(0);
	});
});

describe('calculateMarketValue', () => {
	it('cresce com overall e idade jovem', () => {
		const veteran = calculateMarketValue(90, 28);
		const prospect = calculateMarketValue(90, 18);
		expect(prospect).toBeGreaterThan(veteran);
	});
});
