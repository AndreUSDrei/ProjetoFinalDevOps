import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';
import { pingDb } from './db.js';

const startedAt = Date.now();

export const createApp = ({ db, logger } = {}) => {
	if (!db) {
		throw new Error('Database instance is required');
	}

	const app = express();
	app.disable('x-powered-by');
	app.use(express.json({ limit: '6mb' }));
	app.use(
		cors({
			origin: process.env.CORS_ORIGIN || '*',
		})
	);

	if (logger) {
		app.use(pinoHttp({ logger }));
	}

	app.get('/health', (req, res) => {
		try {
			const databaseUp = pingDb(db);
			if (!databaseUp) {
				return res.status(503).json({
					status: 'error',
					database: 'down',
					uptime: process.uptime(),
					timestamp: new Date().toISOString(),
				});
			}

			return res.json({
				status: 'ok',
				service: 'valorant-manager-api',
				database: 'up',
				uptime: process.uptime(),
				startedAt: new Date(startedAt).toISOString(),
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			req.log?.error({ err: error }, 'health check failed');
			return res.status(503).json({
				status: 'error',
				database: 'down',
				timestamp: new Date().toISOString(),
			});
		}
	});

	app.get('/api/players', (_req, res) => {
		const rows = db.prepare('SELECT payload FROM players').all();
		res.json(rows.map((row) => JSON.parse(row.payload)));
	});

	app.get('/api/organizations', (_req, res) => {
		const rows = db.prepare('SELECT payload FROM organizations').all();
		res.json(rows.map((row) => JSON.parse(row.payload)));
	});

	app.get('/api/saves/:slot', (req, res) => {
		const row = db.prepare('SELECT payload, updated_at FROM saves WHERE id = ?').get(req.params.slot);
		if (!row) {
			return res.status(404).json({ error: 'Save not found' });
		}
		return res.json({
			slot: req.params.slot,
			updatedAt: row.updated_at,
			payload: JSON.parse(row.payload),
		});
	});

	app.put('/api/saves/:slot', (req, res) => {
		const payload = req.body;
		if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
			return res.status(400).json({ error: 'Save payload must be a JSON object' });
		}

		const updatedAt = new Date().toISOString();
		db.prepare(
			`INSERT INTO saves (id, payload, updated_at)
			 VALUES (?, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
		).run(req.params.slot, JSON.stringify(payload), updatedAt);

		req.log?.info({ slot: req.params.slot }, 'save persisted');
		return res.json({ slot: req.params.slot, updatedAt, ok: true });
	});

	return app;
};
