// Geometria top-down (grid 0..20) dos mapas VCT para o match view isométrico.
// Coordenadas em "tiles"; a projeção isométrica é feita no MatchView.
// Ascent foi reconstruído a partir do minimapa oficial: âncoras, callouts,
// paredes e rotas servem tanto ao renderer quanto ao motor de simulação.

const map = (id, name, anchors, boxes, extra = {}) => ({ id, name, ...anchors, boxes, ...extra });

const ascentAnchors = {
	spawnAtt: { x: 10, y: 1.6 },
	spawnDef: { x: 10, y: 18.4 },
	mid: { x: 10, y: 10 },
	siteA: { x: 3.4, y: 12.6 },
	siteB: { x: 16.6, y: 12.6 },
};

const ascentCallouts = [
	{ id: 'attSpawn', name: 'Attacker Spawn', x: 10, y: 1.6 },
	{ id: 'defSpawn', name: 'Defender Spawn', x: 10, y: 18.4 },
	{ id: 'midTop', name: 'Mid Top', x: 8.6, y: 5 },
	{ id: 'aLobby', name: 'A Lobby', x: 4.6, y: 6 },
	{ id: 'bLobby', name: 'B Lobby', x: 14, y: 6.4 },
	{ id: 'aMain', name: 'A Main', x: 4.6, y: 9.4 },
	{ id: 'midCatwalk', name: 'Mid Catwalk', x: 7.4, y: 9 },
	{ id: 'midCourtyard', name: 'Mid Courtyard', x: 10, y: 9.6 },
	{ id: 'midLink', name: 'Mid Link', x: 12.6, y: 9 },
	{ id: 'midCubby', name: 'Mid Cubby', x: 6.4, y: 10.6 },
	{ id: 'aLink', name: 'A Link', x: 5.6, y: 11.6 },
	{ id: 'midBottom', name: 'Mid Bottom', x: 9.6, y: 11.6 },
	{ id: 'bMain', name: 'B Main', x: 14.6, y: 11 },
	{ id: 'aSite', name: 'A Site', x: 3.4, y: 12.6 },
	{ id: 'bSite', name: 'B Site', x: 16.6, y: 12.6 },
	{ id: 'aGarden', name: 'A Garden', x: 5.6, y: 13.6 },
	{ id: 'midPizza', name: 'Mid Pizza', x: 9, y: 13 },
	{ id: 'midMarket', name: 'Mid Market', x: 10.6, y: 14 },
	{ id: 'aRafters', name: 'A Rafters', x: 1.6, y: 14.6 },
	{ id: 'aWindow', name: 'A Window', x: 4, y: 14.6 },
	{ id: 'bBack', name: 'B Back', x: 18, y: 14.6 },
];

const pt = (id) => {
	const c = ascentCallouts.find((item) => item.id === id);
	return { x: c.x, y: c.y };
};

const ascentRoutes = {
	A: [pt('attSpawn'), pt('aLobby'), pt('aMain'), pt('aSite')],
	B: [pt('attSpawn'), pt('bLobby'), pt('bMain'), pt('bSite')],
	midA: [pt('attSpawn'), pt('midTop'), pt('midCatwalk'), pt('midCourtyard'), pt('aLink'), pt('aSite')],
	midB: [pt('attSpawn'), pt('midTop'), pt('midCourtyard'), pt('midLink'), pt('bMain'), pt('bSite')],
	defA: [pt('defSpawn'), pt('midMarket'), pt('aGarden'), pt('aSite')],
	defB: [pt('defSpawn'), pt('bBack'), pt('bSite')],
};

export const MAPS = [
	map(
		'ascent',
		'Ascent',
		ascentAnchors,
		[
			{ x: 8.8, y: 8.8, w: 1.2, h: 1.2 },
			{ x: 11.2, y: 11.2, w: 1.2, h: 1 },
			{ x: 3.2, y: 11.4, w: 1.2, h: 1 },
			{ x: 15.6, y: 11.4, w: 1.2, h: 1 },
		],
		{
			callouts: ascentCallouts,
			routes: ascentRoutes,
			walls: [
				{ x: 6.4, y: 3.2, w: 3.2, h: 1.6, z: 12 },
				{ x: 11.2, y: 4.2, w: 3.2, h: 1.6, z: 12 },
				{ x: 2.2, y: 7, w: 1.8, h: 1.8, z: 10 },
				{ x: 6.2, y: 7.2, w: 1.6, h: 1.2, z: 8 },
				{ x: 11.8, y: 7.2, w: 1.8, h: 1.2, z: 8 },
				{ x: 7.6, y: 11, w: 1.4, h: 1.4, z: 8 },
				{ x: 12.2, y: 12.2, w: 1.8, h: 1.2, z: 10 },
				{ x: 2, y: 14.2, w: 1.8, h: 1.2, z: 10 },
				{ x: 16.2, y: 14.2, w: 1.8, h: 1.2, z: 10 },
				{ x: 8.4, y: 15.6, w: 3.2, h: 1.6, z: 12 },
			],
		}
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