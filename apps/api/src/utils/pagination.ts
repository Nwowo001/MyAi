/**
 * @fileoverview Pagination utility for repository queries.
 *
 * Provides helpers for converting frontend query params into
 * Prisma-compatible skip/take values, and building pagination metadata.
 */

import { PAGINATION } from '@autoagent/config';

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PrismaPage {
  skip: number;
  take: number;
}

/**
 * Parse page and perPage from query parameters with safe defaults.
 *
 * @param rawPage - Raw page value (from req.query)
 * @param rawPerPage - Raw perPage value (from req.query)
 */
export function parsePaginationParams(
  rawPage?: unknown,
  rawPerPage?: unknown,
): PaginationParams {
  const page = Math.max(1, Number(rawPage) || PAGINATION.DEFAULT_PAGE);
  const perPage = Math.min(
    PAGINATION.MAX_PER_PAGE,
    Math.max(1, Number(rawPerPage) || PAGINATION.DEFAULT_PER_PAGE),
  );
  return { page, perPage };
}

/**
 * Convert page/perPage to Prisma skip/take values.
 */
export function toPrismaPage({ page, perPage }: PaginationParams): PrismaPage {
  return {
    skip: (page - 1) * perPage,
    take: perPage,
  };
}
