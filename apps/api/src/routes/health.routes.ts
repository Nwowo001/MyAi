/**
 * @fileoverview Health check route.
 *
 * Provides a simple health endpoint used by:
 * - Load balancers to verify the service is running
 * - Deployment pipelines to confirm startup
 * - Monitoring services for uptime checks
 *
 * The endpoint returns 200 if the service is healthy.
 * Additional checks (database, AI provider) can be added in future.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import { env } from '../config/index.js';

const router = Router();

/**
 * GET /health
 *
 * Returns service status and basic metadata.
 * Does NOT require authentication.
 */
router.get('/', (_req: Request, res: Response): void => {
  sendSuccess(res, {
    status: 'ok',
    service: 'autoagent-api',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '0.1.0',
  });
});

export { router as healthRouter };
