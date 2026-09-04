/**
 * @fileoverview Shared configuration constants for AutoAgent.
 *
 * These values are safe to use in both frontend and backend contexts.
 * Do NOT put secrets here.
 */

/**
 * Default business configuration values.
 * Applied when a field is not provided during onboarding.
 */
export const BUSINESS_DEFAULTS = {
  /** ISO 4217 default currency */
  currency: 'NGN',
  /** IANA timezone default */
  timezone: 'Africa/Lagos',
} as const;

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

/**
 * Conversation configuration.
 */
export const CONVERSATION = {
  /**
   * Maximum number of messages included in the AI context window.
   * Older messages are summarized to avoid token limits.
   */
  MAX_CONTEXT_MESSAGES: 50,

  /**
   * How long (in minutes) to wait before auto-closing a RESOLVED conversation
   * if no new messages arrive.
   */
  AUTO_CLOSE_AFTER_MINUTES: 60 * 24 * 7, // 7 days
} as const;

/**
 * AI configuration defaults.
 * These can be overridden by environment variables on the backend.
 */
export const AI_DEFAULTS = {
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  /** Maximum tool call iterations per turn (prevents infinite loops). */
  MAX_TOOL_ITERATIONS: 5,
} as const;

/**
 * Supported ISO 4217 currency codes.
 * Keep in sync with CurrencyCodeSchema in packages/validation.
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

/**
 * Returns the currency symbol for a given ISO 4217 code.
 * Falls back to the code itself if not found.
 */
export function getCurrencySymbol(code: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? code;
}

/**
 * Formats a monetary amount using the business's currency.
 * Uses the Intl.NumberFormat API for locale-aware formatting.
 *
 * @param amount - The amount in major currency units
 * @param currencyCode - ISO 4217 currency code
 * @param locale - BCP 47 locale string (defaults to 'en-NG')
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en-NG',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency code is not recognized by Intl
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * API route prefix constants.
 * Use these to avoid string literals scattered throughout the codebase.
 */
export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: '/api/auth',
  BUSINESSES: '/api/businesses',
  OFFERINGS: '/api/offerings',
  CUSTOMERS: '/api/customers',
  LEADS: '/api/leads',
  CONVERSATIONS: '/api/conversations',
  MESSAGES: '/api/messages',
  BOOKINGS: '/api/bookings',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  KNOWLEDGE: '/api/knowledge',
  AUTOMATION: '/api/automation',
  AI: '/api/ai',
  WEBHOOKS: {
    WHATSAPP: '/api/webhooks/whatsapp',
    PAYSTACK: '/api/webhooks/paystack',
  },
} as const;

/**
 * HTTP status codes used consistently across the API.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
