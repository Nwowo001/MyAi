/**
 * @fileoverview Offering (Products & Services) controller handlers.
 */

import type { Request, Response } from 'express';
import { offeringService } from '../services/offering.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@autoagent/config';
import type { CreateOfferingInput, UpdateOfferingInput } from '@autoagent/shared';

export async function createOffering(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const input = req.body as CreateOfferingInput;
  const offering = await offeringService.createOffering(businessId, input);
  sendSuccess(res, offering, 'Offering created', HTTP_STATUS.CREATED);
}

export async function listOfferings(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const type = req.query['type'] as 'PRODUCT' | 'SERVICE' | undefined;
  const isActiveRaw = req.query['isActive'];
  const isActive =
    isActiveRaw === 'true' ? true : isActiveRaw === 'false' ? false : undefined;

  const filters: { type?: 'PRODUCT' | 'SERVICE'; isActive?: boolean } = {};
  if (type === 'PRODUCT' || type === 'SERVICE') filters.type = type;
  if (isActive !== undefined) filters.isActive = isActive;

  const offerings = await offeringService.listOfferings(businessId, filters);
  sendSuccess(res, offerings);
}

export async function getOffering(req: Request, res: Response): Promise<void> {
  const { businessId, offeringId } = req.params;
  if (!businessId || !offeringId) {
    sendError(res, 'BAD_REQUEST', 'businessId and offeringId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const offering = await offeringService.getOffering(businessId, offeringId);
  if (!offering) {
    sendError(res, 'NOT_FOUND', 'Offering not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  sendSuccess(res, offering);
}

export async function updateOffering(req: Request, res: Response): Promise<void> {
  const { businessId, offeringId } = req.params;
  if (!businessId || !offeringId) {
    sendError(res, 'BAD_REQUEST', 'businessId and offeringId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const input = req.body as UpdateOfferingInput;
  const updated = await offeringService.updateOffering(businessId, offeringId, input);
  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Offering not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  sendSuccess(res, updated);
}

export async function deactivateOffering(req: Request, res: Response): Promise<void> {
  const { businessId, offeringId } = req.params;
  if (!businessId || !offeringId) {
    sendError(res, 'BAD_REQUEST', 'businessId and offeringId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const success = await offeringService.deactivateOffering(businessId, offeringId);
  if (!success) {
    sendError(res, 'NOT_FOUND', 'Offering not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  sendSuccess(res, { deactivated: true });
}

export async function deleteOffering(req: Request, res: Response): Promise<void> {
  const { businessId, offeringId } = req.params;
  if (!businessId || !offeringId) {
    sendError(res, 'BAD_REQUEST', 'businessId and offeringId are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const deleted = await offeringService.deleteOffering(businessId, offeringId);
  if (!deleted) {
    sendError(res, 'NOT_FOUND', 'Offering not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  sendSuccess(res, { deleted: true });
}
