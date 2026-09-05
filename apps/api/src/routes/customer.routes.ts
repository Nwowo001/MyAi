/**
 * @fileoverview Customer management routes.
 *
 * All routes are mounted under /api/businesses/:businessId/customers
 * and require authentication + tenant membership.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@autoagent/validation';
import {
  createCustomer,
  listCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';

export const customerRouter = Router({ mergeParams: true });

// All customer routes require auth & tenant membership
customerRouter.use(requireAuth, requireTenant);

customerRouter.post('/', validate('body', CreateCustomerSchema), createCustomer);
customerRouter.get('/', listCustomers);
customerRouter.get('/:customerId', getCustomer);
customerRouter.patch('/:customerId', validate('body', UpdateCustomerSchema), updateCustomer);
customerRouter.delete('/:customerId', deleteCustomer);
