/**
 * @fileoverview Global error handling middleware.
 *
 * Must be registered LAST in the Express middleware chain.
 * Catches all unhandled errors thrown from route handlers and services,
 * and returns a consistent API error response.
 *
 * SECURITY:
 * - Internal error details (stack traces) are NEVER sent to the client.
 * - Full error details are always logged server-side.
 * - In development, a sanitized error message is included for debugging.
 *
 * Usage:
 * Register after all routes in app.ts:
 * ```ts
 * app.use(errorHandler);
 * ```
 */

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '@autoagent/config';
import { isDevelopment } from '../config/index.js';

/**
 * Custom application error class.
 * Throw this from services/controllers to produce structured API errors.
 *
 * @example
 * throw new AppError('BOOKING_UNAVAILABLE', 'This slot is no longer available', 409);
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handling middleware.
 * Handles both AppError (operational) and unexpected errors.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Operational errors — thrown intentionally by the application
  if (err instanceof AppError) {
    logger.warn(
      { code: err.code, statusCode: err.statusCode, path: req.path },
      err.message,
    );
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // Unexpected errors — bugs, network failures, etc.
  logger.error(
    { err, path: req.path, method: req.method },
    'Unhandled error in request pipeline',
  );

  const message = isDevelopment && err instanceof Error
    ? err.message
    : 'An unexpected error occurred. Please try again.';

  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
};

/**
 * 404 handler for unmatched routes.
 * Register this BEFORE the error handler but AFTER all other routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`,
    HTTP_STATUS.NOT_FOUND,
  );
}
