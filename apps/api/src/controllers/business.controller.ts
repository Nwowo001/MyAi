/**
 * @fileoverview Business controller handlers.
 */

import type { Request, Response } from 'express';
import { businessService } from '../services/business.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@autoagent/config';
import type { CreateBusinessInput, UpdateBusinessInput, InviteMemberInput, UpdateMemberRoleInput } from '@autoagent/shared';

export async function createBusiness(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.userId;
  if (!userId) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const input = req.body as CreateBusinessInput;
  const result = await businessService.createBusiness(userId, input);

  sendSuccess(res, result, undefined, HTTP_STATUS.CREATED);
}

export async function listUserBusinesses(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.userId;
  if (!userId) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const businesses = await businessService.getUserBusinesses(userId);
  sendSuccess(res, businesses);
}

export async function getBusiness(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const business = await businessService.getBusinessById(businessId);
  if (!business) {
    sendError(res, 'NOT_FOUND', 'Business not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, business);
}

export async function updateBusiness(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const input = req.body as UpdateBusinessInput;
  const updated = await businessService.updateBusiness(businessId, input);

  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Business not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, updated);
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const members = await businessService.getBusinessMembers(businessId);
  sendSuccess(res, members);
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  const businessId = req.params['businessId'];
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const { email, role } = req.body as InviteMemberInput;
  const member = await businessService.inviteMember(businessId, email, role);

  sendSuccess(res, member, undefined, HTTP_STATUS.CREATED);
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  const memberId = req.params['memberId'];
  if (!memberId) {
    sendError(res, 'BAD_REQUEST', 'memberId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const { role } = req.body as UpdateMemberRoleInput;
  const updated = await businessService.updateMemberRole(memberId, role);

  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Member not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, updated);
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  const memberId = req.params['memberId'];
  if (!memberId) {
    sendError(res, 'BAD_REQUEST', 'memberId param required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const removed = await businessService.removeMember(memberId);
  if (!removed) {
    sendError(res, 'NOT_FOUND', 'Member not found', HTTP_STATUS.NOT_FOUND);
    return;
  }

  sendSuccess(res, { removed: true });
}
