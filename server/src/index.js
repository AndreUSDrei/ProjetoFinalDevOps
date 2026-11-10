import { createApp } from './app.js';
import { createDb } from './db.js';
import { createLogger } from './logger.js';

const logger = createLogger();
const port = Number(process.env.PORT) || 3001;

try {
	const db = createDb();
	const app = createApp({ db, logger });

	app.listen(port, '0.0.0.0', () => {
		logger.info({ port, env: process.env.NODE_ENV || 'development' }, 'API listening');
	});
} catch (error) {
	logger.fatal({ err: error }, 'failed to start API');
	process.exit(1);
}
