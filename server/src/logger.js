import pino from 'pino';

export const createLogger = (overrides = {}) =>
	pino({
		level: process.env.LOG_LEVEL || 'info',
		base: { service: 'valorant-manager-api' },
		timestamp: pino.stdTimeFunctions.isoTime,
		...overrides,
	});
