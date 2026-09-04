/**
 * @fileoverview Rate limiting middleware.
 *
 * Protects the API from abuse and brute-force attacks.
 * Different rate limits are applied to different route categories.
 *
 * Limits are intentionally generous for legitimate use and strict enough
 * to deter abuse. Adjust per environment as needed.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '@autoagent/config';
import type { ApiErrorResponse } from '@autoagent/shared';

/**
 * Standard JSON error response for rate limit exceeded.
 */
const rateLimitHandler = (_req: Request, res: Response) => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait before trying again.',
    },
  };
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(response);
};

/**
 * General API rate limit.
 * Applied to most authenticated endpoints.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Auth rate limit (stricter).
 * Applied to login, register, and password reset endpoints.
 * Prevents brute-force credential attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Webhook rate limit.
 * Applied to WhatsApp and Paystack webhook endpoints.
 * These are called by external services, not end users.
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * AI endpoint rate limit.
 * Applied to AI chat endpoints to control LLM API costs.
 */
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});
