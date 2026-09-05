/**
 * @fileoverview Tenant isolation middleware.
 *
 * AutoAgent is a multi-tenant platform. Every business-owned resource must be
 * accessed through a verified tenant context.
 *
 * This middleware:
 * 1. Reads the businessId from route parameters (`:businessId`) or `X-Business-ID` header.
 * 2. Verifies the authenticated user is a member of that business.
 * 3. Attaches the verified tenant context to `req.tenant`.
 *
 * SECURITY:
 * - Prevents IDOR (Insecure Direct Object Reference) data leakage.
 * - Enforces multi-tenant data boundary at the HTTP boundary.
 */

import type { Request, Response, NextFunction } from 'express';
import { businessService } from '../services/business.service.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '@autoagent/config';

/**
 * Tenant context attached to the request after verification.
 * Access via `req.tenant` in downstream handlers and services.
 */
export interface TenantContext {
  businessId: string;
  /** The authenticated user's role in this business */
  role: string;
  /** The user's granted permissions in this business */
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Middleware: Verify the authenticated user has access to the requested business.
 *
 * Expects:
 * - `req.auth` to be set by `requireAuth` middleware.
 * - `req.params.businessId` or `X-Business-ID` header.
 */
export async function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const businessId =
    req.params['businessId'] || (req.headers['x-business-id'] as string | undefined);

  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required in route params or X-Business-ID header', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  try {
    const member = await businessService.verifyUserMembership(businessId, req.auth.userId);

    if (!member) {
      logger.warn({ userId: req.auth.userId, businessId }, 'Access denied — User is not a member of this business');
      sendError(res, 'FORBIDDEN', 'Access denied to target business context', HTTP_STATUS.FORBIDDEN);
      return;
    }

    req.tenant = {
      businessId,
      role: member.role,
      permissions: member.permissions,
    };

    logger.debug({ userId: req.auth.userId, businessId, role: member.role }, 'Tenant context verified');
    next();
  } catch (err) {
    logger.error({ err, businessId }, 'Tenant verification failed');
    sendError(res, 'INTERNAL_ERROR', 'Tenant verification error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
