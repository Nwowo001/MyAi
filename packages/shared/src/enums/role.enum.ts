/**
 * @fileoverview User role and permission enums.
 *
 * AutoAgent supports multi-member businesses. Each BusinessMember has a role
 * that defines their default level of access.
 *
 * Roles are ordered by privilege: OWNER > ADMIN > STAFF > VIEWER.
 */

/**
 * The role of a user within a business.
 */
export enum BusinessRole {
  /**
   * Full control over the business. Can manage all settings, integrations,
   * billing, team members, and all business data.
   * Each business has exactly one OWNER.
   */
  OWNER = 'OWNER',

  /**
   * Can manage most business operations but cannot delete the business
   * or manage billing. Can add/remove STAFF and VIEWER members.
   */
  ADMIN = 'ADMIN',

  /**
   * Operational access. Can handle conversations, manage customers,
   * create bookings/orders. Permissions are configurable per staff member.
   */
  STAFF = 'STAFF',

  /**
   * Read-only access to analytics and reports.
   */
  VIEWER = 'VIEWER',
}

/**
 * Granular permissions that can be assigned to STAFF members.
 * OWNER and ADMIN implicitly have all permissions.
 */
export enum Permission {
  // Conversation permissions
  VIEW_CONVERSATIONS = 'VIEW_CONVERSATIONS',
  MANAGE_CONVERSATIONS = 'MANAGE_CONVERSATIONS',
  TAKE_OVER_CONVERSATIONS = 'TAKE_OVER_CONVERSATIONS',

  // Customer permissions
  VIEW_CUSTOMERS = 'VIEW_CUSTOMERS',
  MANAGE_CUSTOMERS = 'MANAGE_CUSTOMERS',

  // Lead permissions
  VIEW_LEADS = 'VIEW_LEADS',
  MANAGE_LEADS = 'MANAGE_LEADS',

  // Offering permissions
  VIEW_OFFERINGS = 'VIEW_OFFERINGS',
  MANAGE_OFFERINGS = 'MANAGE_OFFERINGS',

  // Booking permissions
  VIEW_BOOKINGS = 'VIEW_BOOKINGS',
  MANAGE_BOOKINGS = 'MANAGE_BOOKINGS',

  // Order permissions
  VIEW_ORDERS = 'VIEW_ORDERS',
  MANAGE_ORDERS = 'MANAGE_ORDERS',

  // Payment permissions
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',

  // Analytics permissions
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',

  // Knowledge base permissions
  MANAGE_KNOWLEDGE = 'MANAGE_KNOWLEDGE',
}
