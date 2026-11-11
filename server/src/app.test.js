import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from './app.js';
import { createDb } from './db.js';

let db;
let app;

before(() => {
	process.env.LOG_LEVEL = 'silent';
	db = createDb(':memory:');
	app = createApp({ db });
});

after(() => {
	db?.close();
});

test('GET /health returns ok and sqlite ping', async () => {
	const res = await request(app).get('/health');
	assert.equal(res.status, 200);
	assert.equal(res.body.status, 'ok');
	assert.equal(res.body.database, 'up');
	assert.equal(typeof res.body.uptime, 'number');
});

test('GET /api/players returns seeded roster', async () => {
	const res = await request(app).get('/api/players');
	assert.equal(res.status, 200);
	assert.ok(Array.isArray(res.body));
	assert.ok(res.body.length > 0);
	assert.ok(res.body[0].id);
	assert.ok(res.body[0].nickname);
});

test('GET /api/organizations returns seeded teams', async () => {
	const res = await request(app).get('/api/organizations');
	assert.equal(res.status, 200);
	assert.ok(Array.isArray(res.body));
	assert.ok(res.body.length > 0);
	assert.ok(res.body[0].name);
});

test('GET /api/saves/default is 404 before first write', async () => {
	const res = await request(app).get('/api/saves/default');
	assert.equal(res.status, 404);
});

test('PUT then GET /api/saves/default persists campaign state', async () => {
	const payload = {
		gameState: 'DASHBOARD',
		budget: 1500000,
		manager: { managerName: 'Teste', country: 'Brasil' },
	};

	const put = await request(app).put('/api/saves/default').send(payload);
	assert.equal(put.status, 200);
	assert.equal(put.body.ok, true);

	const get = await request(app).get('/api/saves/default');
	assert.equal(get.status, 200);
	assert.equal(get.body.payload.budget, 1500000);
	assert.equal(get.body.payload.manager.managerName, 'Teste');
});

test('PUT /api/saves/default rejects non-object payloads', async () => {
	const res = await request(app).put('/api/saves/default').send([1, 2, 3]);
	assert.equal(res.status, 400);
});

test('PUT /api/saves/:slot rejects invalid slot ids', async () => {
	const res = await request(app).put('/api/saves/bad..slot').send({ gameState: 'SETUP' });
	assert.equal(res.status, 400);
});

test('GET /api/saves/:slot rejects invalid slot ids', async () => {
	const res = await request(app).get('/api/saves/bad..slot');
	assert.equal(res.status, 400);
});
