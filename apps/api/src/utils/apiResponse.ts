/**
 * @fileoverview Consistent API response helpers.
 *
 * All Express route handlers should use these helpers to ensure
 * every response follows the same shape. This makes the frontend
 * easier to write and API errors easier to debug.
 *
 * @example
 * // Success
 * return sendSuccess(res, { conversation }, 'Conversation created', 201);
 *
 * @example
 * // Error
 * return sendError(res, 'NOT_FOUND', 'Conversation not found', 404);
 *
 * @example
 * // Paginated
 * return sendPaginated(res, conversations, { total, page, perPage });
 */

import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '@autoagent/shared';
import { HTTP_STATUS } from '@autoagent/config';

/**
 * Send a successful API response.
 *
 * @param res - Express Response object
 * @param data - Response payload
 * @param message - Optional human-readable message
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK,
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error API response.
 *
 * @param res - Express Response object
 * @param code - Machine-readable error code (e.g. 'NOT_FOUND')
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code (default: 500)
 * @param fieldErrors - Optional per-field validation errors
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  fieldErrors?: Record<string, string[]>,
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  };
  res.status(statusCode).json(response);
}

/**
 * Send a paginated list response.
 *
 * @param res - Express Response object
 * @param data - Array of items for the current page
 * @param meta - Pagination metadata
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
): void {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination: meta,
  });
}

/**
 * Build pagination metadata from query parameters and total count.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage);
  return {
    total,
    page,
    perPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
