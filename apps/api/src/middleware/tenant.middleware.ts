/**
 * @fileoverview Tenant isolation middleware.
 *
 * AutoAgent is a multi-tenant platform. Every business-owned resource must be
 * accessed through a verified tenant context.
 *
 * This middleware:
 * 1. Reads the businessId from the route parameter (`:businessId`).
 * 2. Verifies the authenticated user is a member of that business.
 * 3. Attaches the verified tenant context to `req.tenant`.
 *
 * SECURITY:
 * - This prevents IDOR (Insecure Direct Object Reference) attacks.
 * - A user cannot access another business's data by guessing a businessId.
 * - All business-scoped routes should use this middleware.
 *
 * Usage:
 * ```ts
 * router.get('/:businessId/conversations', requireAuth, requireTenant, handler);
 * ```
 */

import type { Request, Response, NextFunction } from 'express';
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
 * - `req.params.businessId` to be present in the route.
 *
 * NOTE: This is a stub implementation for Phase 1.
 * The full implementation (database query) will be added in Phase 3 when
 * Prisma is configured and the BusinessMember table exists.
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

  const businessId = req.params['businessId'];

  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'businessId is required', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  try {
    // TODO (Phase 3): Replace this stub with a real database query:
    //
    // const member = await prisma.businessMember.findFirst({
    //   where: { businessId, userId: req.auth.userId },
    //   select: { role: true, permissions: true },
    // });
    //
    // if (!member) {
    //   return sendError(res, 'FORBIDDEN', 'Access denied', HTTP_STATUS.FORBIDDEN);
    // }
    //
    // req.tenant = { businessId, role: member.role, permissions: member.permissions };

    // Phase 1 stub — attach minimal tenant context
    req.tenant = {
      businessId,
      role: 'OWNER', // placeholder
      permissions: [],
    };

    logger.debug({ userId: req.auth.userId, businessId }, 'Tenant context attached');
    next();
  } catch (err) {
    logger.error({ err, businessId }, 'Tenant verification failed');
    sendError(res, 'INTERNAL_ERROR', 'Tenant verification failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
