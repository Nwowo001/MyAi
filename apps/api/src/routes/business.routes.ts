/**
 * @fileoverview Business management routes.
 */

import { Router } from 'express';
import {
  createBusiness,
  listUserBusinesses,
  getBusiness,
  updateBusiness,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/business.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  CreateBusinessSchema,
  UpdateBusinessSchema,
  InviteMemberSchema,
  UpdateMemberRoleSchema,
} from '@autoagent/validation';
import { offeringRouter } from './offering.routes.js';
import { customerRouter } from './customer.routes.js';
import { conversationRouter } from './conversation.routes.js';
import {
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
} from '../controllers/whatsappConnect.controller.js';

const router = Router();

// All business routes require authentication
router.use(requireAuth);

// Business list & creation
router.get('/', listUserBusinesses);
router.post('/', validate('body', CreateBusinessSchema), createBusiness);

// Business-specific endpoints (require tenant membership)
router.get('/:businessId', requireTenant, getBusiness);
router.patch('/:businessId', requireTenant, validate('body', UpdateBusinessSchema), updateBusiness);

// Team member management
router.get('/:businessId/members', requireTenant, listMembers);
router.post('/:businessId/members', requireTenant, validate('body', InviteMemberSchema), inviteMember);
router.patch('/:businessId/members/:memberId', requireTenant, validate('body', UpdateMemberRoleSchema), updateMemberRole);
router.delete('/:businessId/members/:memberId', requireTenant, removeMember);

// ── Nested resource routers ───────────────────────────────────────────────────
// Offerings (Products & Services) are nested under a business
router.use('/:businessId/offerings', offeringRouter);
// Customers & Leads are nested under a business
router.use('/:businessId/customers', customerRouter);
// Conversations inbox nested under a business
router.use('/:businessId/conversations', conversationRouter);

// ── WhatsApp Connect (Embedded Signup OAuth) ──────────────────────────────────
router.post('/:businessId/whatsapp/connect', requireTenant, connectWhatsApp);
router.get('/:businessId/whatsapp/status', requireTenant, getWhatsAppStatus);
router.delete('/:businessId/whatsapp/disconnect', requireTenant, disconnectWhatsApp);

export { router as businessRouter };
