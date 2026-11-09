// Geometria top-down (grid 0..20) dos mapas VCT para o match view isométrico.
// Coordenadas em "tiles"; a projeção isométrica é feita no MatchView.

const map = (id, name, anchors, boxes) => ({ id, name, ...anchors, boxes });

export const MAPS = [
	map(
		'ascent',
		'Ascent',
		{
			spawnAtt: { x: 3, y: 17 },
			spawnDef: { x: 17, y: 3 },
			mid: { x: 10, y: 10 },
			siteA: { x: 5, y: 6 },
			siteB: { x: 15, y: 14 },
		},
		[
			{ x: 8, y: 8, w: 2, h: 2 },
			{ x: 11, y: 11, w: 2, h: 1 },
			{ x: 4, y: 4, w: 2, h: 1 },
			{ x: 14, y: 16, w: 2, h: 1 },
		]
	),
	map(
		'bind',
		'Bind',
		{
			spawnAtt: { x: 3, y: 16 },
			spawnDef: { x: 17, y: 4 },
			mid: { x: 10, y: 9 },
			siteA: { x: 6, y: 5 },
			siteB: { x: 14, y: 15 },
		},
		[
			{ x: 8, y: 6, w: 2, h: 2 },
			{ x: 11, y: 12, w: 2, h: 2 },
			{ x: 5, y: 3, w: 1, h: 2 },
			{ x: 15, y: 17, w: 1, h: 2 },
		]
	),
	map(
		'haven',
		'Haven',
		{
			spawnAtt: { x: 3, y: 17 },
			spawnDef: { x: 17, y: 3 },
			mid: { x: 10, y: 10 },
			siteA: { x: 5, y: 7 },
			siteB: { x: 15, y: 13 },
		},
		[
			{ x: 9, y: 6, w: 2, h: 1 },
			{ x: 9, y: 13, w: 2, h: 1 },
			{ x: 4, y: 5, w: 1, h: 2 },
			{ x: 16, y: 14, w: 1, h: 2 },
		]
	),
	map(
		'split',
		'Split',
		{
			spawnAtt: { x: 4, y: 16 },
			spawnDef: { x: 16, y: 4 },
			mid: { x: 10, y: 10 },
			siteA: { x: 6, y: 4 },
			siteB: { x: 14, y: 16 },
		},
		[
			{ x: 9, y: 9, w: 2, h: 2 },
			{ x: 6, y: 6, w: 1, h: 2 },
			{ x: 13, y: 12, w: 1, h: 2 },
		]
	),
	map(
		'lotus',
		'Lotus',
		{
			spawnAtt: { x: 3, y: 16 },
			spawnDef: { x: 17, y: 4 },
			mid: { x: 10, y: 10 },
			siteA: { x: 5, y: 5 },
			siteB: { x: 15, y: 15 },
		},
		[
			{ x: 8, y: 10, w: 2, h: 1 },
			{ x: 11, y: 8, w: 1, h: 2 },
			{ x: 4, y: 3, w: 2, h: 1 },
			{ x: 14, y: 17, w: 2, h: 1 },
		]
	),
];

export const getMap = (id) => MAPS.find((m) => m.id === id) || MAPS[0];