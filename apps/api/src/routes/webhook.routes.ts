/**
 * @fileoverview Webhook routes.
 *
 * POST /webhooks/whatsapp  — Meta WhatsApp Cloud API
 * GET  /webhooks/whatsapp  — Meta webhook verification
 */

import { Router } from 'express';
import {
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
} from '../controllers/whatsapp.controller.js';

const router = Router();

// WhatsApp
router.get('/whatsapp', verifyWhatsAppWebhook);
router.post('/whatsapp', handleWhatsAppWebhook);

export { router as webhookRouter };
