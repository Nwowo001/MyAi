/**
 * @fileoverview Customer controller.
 */

import type { Request, Response } from 'express';
import { customerService } from '../services/customer.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@autoagent/config';
import type { CreateCustomerInput, UpdateCustomerInput, LeadStatus } from '@autoagent/shared';

export async function createCustomer(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const input: CreateCustomerInput = req.body;
  const customer = await customerService.createCustomer(businessId, input);
  sendSuccess(res, customer, 'Customer created', HTTP_STATUS.CREATED);
}

export async function listCustomers(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
  const leadStatus = req.query['leadStatus'] as LeadStatus | undefined;

  const filters: { search?: string; leadStatus?: LeadStatus } = {};
  if (search) filters.search = search;
  if (leadStatus) filters.leadStatus = leadStatus;

  const customers = await customerService.listCustomers(businessId, filters);
  sendSuccess(res, customers);
}

export async function getCustomer(req: Request, res: Response): Promise<void> {
  const { businessId, customerId } = req.params;
  if (!businessId || !customerId) {
    sendError(res, 'BAD_REQUEST', 'businessId and customerId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const customer = await customerService.getCustomer(businessId, customerId);
  if (!customer) {
    sendError(res, 'NOT_FOUND', 'Customer not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, customer);
}

export async function updateCustomer(req: Request, res: Response): Promise<void> {
  const { businessId, customerId } = req.params;
  if (!businessId || !customerId) {
    sendError(res, 'BAD_REQUEST', 'businessId and customerId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const input: UpdateCustomerInput = req.body;
  const updated = await customerService.updateCustomer(businessId, customerId, input);
  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Customer not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, updated, 'Customer updated');
}

export async function deleteCustomer(req: Request, res: Response): Promise<void> {
  const { businessId, customerId } = req.params;
  if (!businessId || !customerId) {
    sendError(res, 'BAD_REQUEST', 'businessId and customerId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const deleted = await customerService.deleteCustomer(businessId, customerId);
  if (!deleted) {
    sendError(res, 'NOT_FOUND', 'Customer not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, { id: customerId }, 'Customer deleted');
}
