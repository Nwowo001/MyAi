/**
 * @fileoverview Offering routes.
 *
 * All routes are mounted under /api/businesses/:businessId/offerings
 * and require authentication + tenant membership.
 *
 * Route structure:
 * POST   /                         — Create offering
 * GET    /                         — List offerings (filterable by type/isActive)
 * GET    /:offeringId              — Get single offering
 * PATCH  /:offeringId              — Update offering
 * PATCH  /:offeringId/deactivate   — Soft-delete (set isActive = false)
 * DELETE /:offeringId              — Hard-delete offering
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateOfferingSchema, UpdateOfferingSchema } from '@autoagent/validation';
import {
  createOffering,
  listOfferings,
  getOffering,
  updateOffering,
  deactivateOffering,
  deleteOffering,
} from '../controllers/offering.controller.js';

export const offeringRouter = Router({ mergeParams: true });

// All offering routes require authentication and tenant membership
offeringRouter.use(requireAuth, requireTenant);

offeringRouter.post('/', validate('body', CreateOfferingSchema), createOffering);
offeringRouter.get('/', listOfferings);
offeringRouter.get('/:offeringId', getOffering);
offeringRouter.patch('/:offeringId', validate('body', UpdateOfferingSchema), updateOffering);
offeringRouter.patch('/:offeringId/deactivate', deactivateOffering);
offeringRouter.delete('/:offeringId', deleteOffering);

