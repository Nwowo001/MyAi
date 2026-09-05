/**
 * @fileoverview Root router — mounts all sub-routers.
 *
 * This is the single entry point for all API routes.
 * Import this in app.ts and mount at '/'.
 *
 * Route structure:
 * GET  /health                                              — Health check (unauthenticated)
 * ALL  /api/businesses/*                                   — Business management
 * ALL  /api/businesses/:businessId/offerings/*             — Offering management
 * ALL  /api/businesses/:businessId/customers/*             — Customer management
 * ALL  /api/businesses/:businessId/conversations/*         — Conversation management
 * GET  /api/webhooks/whatsapp                              — WhatsApp webhook verification
 * POST /api/webhooks/whatsapp                              — WhatsApp inbound messages
 */

import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { businessRouter } from './business.routes.js';
import { webhookRouter } from './webhook.routes.js';
import { uploadRouter } from './upload.routes.js';

const router = Router();

// ── Unauthenticated routes ────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Webhook routes (externally called by Meta/Paystack — NO auth middleware) ──
router.use('/webhooks', webhookRouter);

// ── API routes (authenticated via requireAuth middleware inside each router) ──
router.use('/businesses', businessRouter);
router.use('/upload', uploadRouter);

export { router as rootRouter };
export default router;
