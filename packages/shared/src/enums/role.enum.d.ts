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
export declare enum BusinessRole {
    /**
     * Full control over the business. Can manage all settings, integrations,
     * billing, team members, and all business data.
     * Each business has exactly one OWNER.
     */
    OWNER = "OWNER",
    /**
     * Can manage most business operations but cannot delete the business
     * or manage billing. Can add/remove STAFF and VIEWER members.
     */
    ADMIN = "ADMIN",
    /**
     * Operational access. Can handle conversations, manage customers,
     * create bookings/orders. Permissions are configurable per staff member.
     */
    STAFF = "STAFF",
    /**
     * Read-only access to analytics and reports.
     */
    VIEWER = "VIEWER"
}
/**
 * Granular permissions that can be assigned to STAFF members.
 * OWNER and ADMIN implicitly have all permissions.
 */
export declare enum Permission {
    VIEW_CONVERSATIONS = "VIEW_CONVERSATIONS",
    MANAGE_CONVERSATIONS = "MANAGE_CONVERSATIONS",
    TAKE_OVER_CONVERSATIONS = "TAKE_OVER_CONVERSATIONS",
    VIEW_CUSTOMERS = "VIEW_CUSTOMERS",
    MANAGE_CUSTOMERS = "MANAGE_CUSTOMERS",
    VIEW_LEADS = "VIEW_LEADS",
    MANAGE_LEADS = "MANAGE_LEADS",
    VIEW_OFFERINGS = "VIEW_OFFERINGS",
    MANAGE_OFFERINGS = "MANAGE_OFFERINGS",
    VIEW_BOOKINGS = "VIEW_BOOKINGS",
    MANAGE_BOOKINGS = "MANAGE_BOOKINGS",
    VIEW_ORDERS = "VIEW_ORDERS",
    MANAGE_ORDERS = "MANAGE_ORDERS",
    VIEW_PAYMENTS = "VIEW_PAYMENTS",
    VIEW_ANALYTICS = "VIEW_ANALYTICS",
    MANAGE_KNOWLEDGE = "MANAGE_KNOWLEDGE"
}
//# sourceMappingURL=role.enum.d.ts.map