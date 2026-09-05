/**
 * @fileoverview Authentication middleware.
 *
 * Verifies Supabase JWT tokens on every protected route.
 * Attaches the authenticated user's Supabase ID to `req.auth`.
 *
 * Usage:
 * ```ts
 * router.get('/protected', requireAuth, handler);
 * ```
 *
 * SECURITY:
 * - Tokens are verified using Supabase Auth admin SDK — not trusting the client.
 * - The user's `sub` (UUID) is extracted from the verified token payload.
 * - No database call is made here; use subsequent middleware for business membership checks.
 */

import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env, isDevelopment } from '../config/index.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '@autoagent/config';

/**
 * Authenticated user context attached to the request by this middleware.
 * Access via `req.auth` in downstream handlers.
 */
export interface AuthContext {
  /** Supabase Auth user UUID */
  userId: string;
  /** User's email address (from token) */
  email: string;
}

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

// Supabase admin client — used for JWT verification
const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

/**
 * Middleware: Require a valid Supabase JWT.
 * Rejects requests with missing, malformed, or expired tokens.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Authorization header required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const token = authHeader.substring(7);

  // Development mock bypass for testing before live Supabase credentials are input
  if (isDevelopment && token.startsWith('dev-mock-token-')) {
    const mockUserId = token.replace('dev-mock-token-', '') || 'usr_dev_owner_001';
    req.auth = {
      userId: mockUserId,
      email: `${mockUserId}@autoagent.dev`,
    };
    next();
    return;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      logger.warn({ error: error?.message }, 'Invalid or expired JWT');
      sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    req.auth = {
      userId: data.user.id,
      email: data.user.email ?? '',
    };

    next();
  } catch (err) {
    logger.error({ err }, 'JWT verification failed unexpectedly');
    sendError(res, 'UNAUTHORIZED', 'Authentication failed', HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Middleware: Optionally authenticate.
 * Attaches auth context if a token is present but does not reject if absent.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  if (isDevelopment && token.startsWith('dev-mock-token-')) {
    const mockUserId = token.replace('dev-mock-token-', '') || 'usr_dev_owner_001';
    req.auth = {
      userId: mockUserId,
      email: `${mockUserId}@autoagent.dev`,
    };
    next();
    return;
  }

  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data.user) {
      req.auth = {
        userId: data.user.id,
        email: data.user.email ?? '',
      };
    }
  } catch {
    // Non-fatal — proceed without auth context
  }

  next();
}
