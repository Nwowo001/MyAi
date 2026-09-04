/**
 * @fileoverview API Server entrypoint.
 *
 * Initializes and starts the Express server, handling graceful shutdown on SIGINT/SIGTERM.
 */

import { createApp } from './app.js';
import { env } from './config/index.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  logger.info(
    {
      port: env.API_PORT,
      env: env.NODE_ENV,
      aiProvider: env.AI_PROVIDER,
      aiModel: env.AI_MODEL,
    },
    `🚀 AutoAgent API running on port ${env.API_PORT} [${env.NODE_ENV}]`
  );
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit if not closed within 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
