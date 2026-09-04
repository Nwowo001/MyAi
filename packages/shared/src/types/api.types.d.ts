/**
 * @fileoverview Standard API response shapes.
 *
 * All AutoAgent API endpoints return one of these shapes.
 * This ensures the frontend always knows how to handle responses.
 */
/**
 * A successful API response containing data.
 *
 * @template T - The type of the response data payload.
 */
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    /** Optional human-readable message */
    message?: string;
}
/**
 * A failed API response containing a structured error.
 */
export interface ApiErrorResponse {
    success: false;
    error: ApiError;
}
/**
 * Structured API error returned on failure.
 */
export interface ApiError {
    /**
     * Machine-readable error code for programmatic handling.
     * Examples: 'NOT_FOUND', 'UNAUTHORIZED', 'BOOKING_UNAVAILABLE'
     */
    code: string;
    /** Human-readable error message (safe to show to developers, not always to end users). */
    message: string;
    /** Optional field-level validation errors (used for form validation). */
    fieldErrors?: Record<string, string[]>;
}
/** Union type representing any API response. */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
/**
 * Standard pagination metadata included in list responses.
 */
export interface PaginationMeta {
    /** Total number of matching records. */
    total: number;
    /** Current page number (1-indexed). */
    page: number;
    /** Number of records per page. */
    perPage: number;
    /** Total number of pages. */
    totalPages: number;
    /** Whether there is a next page. */
    hasNextPage: boolean;
    /** Whether there is a previous page. */
    hasPreviousPage: boolean;
}
/**
 * A paginated API response.
 * @template T - The type of each item in the list.
 */
export interface PaginatedApiResponse<T = unknown> {
    success: true;
    data: T[];
    pagination: PaginationMeta;
}
/**
 * Standard query parameters for list endpoints.
 */
export interface ListQueryParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=api.types.d.ts.map