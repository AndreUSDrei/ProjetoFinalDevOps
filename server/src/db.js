import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultDbPath = () => process.env.DATABASE_PATH || path.join(__dirname, '../data/app.db');

const defaultSeedDir = () => process.env.SEED_DIR || path.join(__dirname, '../../src/data');

export const pingDb = (db) => {
	const row = db.prepare('SELECT 1 AS ok').get();
	return row?.ok === 1;
};

export const createDb = (dbPath = defaultDbPath()) => {
	if (dbPath !== ':memory:') {
		fs.mkdirSync(path.dirname(dbPath), { recursive: true });
	}

	const db = new DatabaseSync(dbPath);
	db.exec('PRAGMA journal_mode = WAL');
	db.exec(`
		CREATE TABLE IF NOT EXISTS players (
			id TEXT PRIMARY KEY,
			payload TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS organizations (
			id TEXT PRIMARY KEY,
			payload TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS saves (
			id TEXT PRIMARY KEY,
			payload TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`);

	seedIfEmpty(db);
	return db;
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const seedIfEmpty = (db) => {
	const playerCount = db.prepare('SELECT COUNT(*) AS c FROM players').get().c;
	const orgCount = db.prepare('SELECT COUNT(*) AS c FROM organizations').get().c;
	if (playerCount > 0 && orgCount > 0) return;

	const seedDir = defaultSeedDir();
	const players = readJson(path.join(seedDir, 'players.json'));
	const organizations = readJson(path.join(seedDir, 'teams.json'));

	const insertPlayer = db.prepare('INSERT OR REPLACE INTO players (id, payload) VALUES (?, ?)');
	const insertOrg = db.prepare('INSERT OR REPLACE INTO organizations (id, payload) VALUES (?, ?)');

	db.exec('BEGIN');
	try {
		if (playerCount === 0) {
			for (const player of players) {
				insertPlayer.run(String(player.id), JSON.stringify(player));
			}
		}
		if (orgCount === 0) {
			for (const org of organizations) {
				insertOrg.run(String(org.id), JSON.stringify(org));
			}
		}
		db.exec('COMMIT');
	} catch (error) {
		db.exec('ROLLBACK');
		throw error;
	}
};
