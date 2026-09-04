/**
 * @fileoverview Request validation middleware using Zod schemas.
 *
 * Validates request bodies, query parameters, and route params against
 * Zod schemas before the request reaches the controller.
 *
 * On validation failure, returns a 422 response with per-field error details
 * that the frontend can use directly in form validation.
 *
 * Usage:
 * ```ts
 * import { validate } from '@/middleware/validate.middleware';
 * import { CreateBusinessSchema } from '@autoagent/validation';
 *
 * router.post('/', requireAuth, validate('body', CreateBusinessSchema), createBusiness);
 * ```
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '@autoagent/config';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Create a validation middleware for the given schema and request target.
 *
 * On success, the parsed (and coerced) data replaces `req[target]`.
 * On failure, a 422 response with field-level errors is returned.
 *
 * @param target - Which part of the request to validate
 * @param schema - Zod schema to validate against
 */
export function validate<T>(target: ValidationTarget, schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const fieldErrors = formatZodErrors(result.error);
      sendError(
        res,
        'VALIDATION_ERROR',
        'Request validation failed',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        fieldErrors,
      );
      return;
    }

    // Replace with parsed data (handles defaults and coercion)
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}

/**
 * Format ZodError issues into a Record of fieldName → error messages.
 * This shape is directly usable by react-hook-form's setError function.
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = path || '_root';

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }
    fieldErrors[key]!.push(issue.message);
  }

  return fieldErrors;
}
