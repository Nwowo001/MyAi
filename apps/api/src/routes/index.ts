/**
 * @fileoverview Root router — mounts all sub-routers.
 *
 * This is the single entry point for all API routes.
 * Import this in app.ts and mount at '/'.
 *
 * Route structure:
 * GET  /health                         — Health check (unauthenticated)
 * POST /api/auth/*                     — Auth helpers (Supabase handles actual auth)
 * ALL  /api/businesses/*               — Business management
 * ALL  /api/offerings/*                — Offering management
 * ALL  /api/customers/*                — Customer management
 * ALL  /api/leads/*                    — Lead management
 * ALL  /api/conversations/*            — Conversation management
 * ALL  /api/messages/*                 — Message management
 * ALL  /api/bookings/*                 — Booking management
 * ALL  /api/orders/*                   — Order management
 * ALL  /api/payments/*                 — Payment management
 * ALL  /api/knowledge/*                — Knowledge base management
 * ALL  /api/ai/*                       — AI orchestration endpoints
 * POST /api/webhooks/whatsapp          — WhatsApp webhook
 * POST /api/webhooks/paystack          — Paystack webhook
 */

import { Router } from 'express';
import { healthRouter } from './health.routes.js';
// Future route imports will be added here as each phase is built:
// import { businessRouter } from './business.routes.js';
// import { offeringRouter } from './offering.routes.js';
// import { customerRouter } from './customer.routes.js';
// import { conversationRouter } from './conversation.routes.js';
// import { bookingRouter } from './booking.routes.js';
// import { orderRouter } from './order.routes.js';
// import { paymentRouter } from './payment.routes.js';
// import { knowledgeRouter } from './knowledge.routes.js';
// import { aiRouter } from './ai.routes.js';
// import { webhookRouter } from './webhook.routes.js';

import { businessRouter } from './business.routes.js';

const router = Router();

// ── Unauthenticated routes ────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── API routes (authenticated) ────────────────────────────────────────────────
router.use('/businesses', businessRouter);
// router.use('/api/offerings', offeringRouter);
// router.use('/api/customers', customerRouter);
// router.use('/api/conversations', conversationRouter);
// router.use('/api/bookings', bookingRouter);
// router.use('/api/orders', orderRouter);
// router.use('/api/payments', paymentRouter);
// router.use('/api/knowledge', knowledgeRouter);
// router.use('/api/ai', aiRouter);

// ── Webhook routes (externally called) ───────────────────────────────────────
// router.use('/api/webhooks', webhookRouter);

export { router as rootRouter };
export default router;
