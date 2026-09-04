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
export var BusinessRole;
(function (BusinessRole) {
    /**
     * Full control over the business. Can manage all settings, integrations,
     * billing, team members, and all business data.
     * Each business has exactly one OWNER.
     */
    BusinessRole["OWNER"] = "OWNER";
    /**
     * Can manage most business operations but cannot delete the business
     * or manage billing. Can add/remove STAFF and VIEWER members.
     */
    BusinessRole["ADMIN"] = "ADMIN";
    /**
     * Operational access. Can handle conversations, manage customers,
     * create bookings/orders. Permissions are configurable per staff member.
     */
    BusinessRole["STAFF"] = "STAFF";
    /**
     * Read-only access to analytics and reports.
     */
    BusinessRole["VIEWER"] = "VIEWER";
})(BusinessRole || (BusinessRole = {}));
/**
 * Granular permissions that can be assigned to STAFF members.
 * OWNER and ADMIN implicitly have all permissions.
 */
export var Permission;
(function (Permission) {
    // Conversation permissions
    Permission["VIEW_CONVERSATIONS"] = "VIEW_CONVERSATIONS";
    Permission["MANAGE_CONVERSATIONS"] = "MANAGE_CONVERSATIONS";
    Permission["TAKE_OVER_CONVERSATIONS"] = "TAKE_OVER_CONVERSATIONS";
    // Customer permissions
    Permission["VIEW_CUSTOMERS"] = "VIEW_CUSTOMERS";
    Permission["MANAGE_CUSTOMERS"] = "MANAGE_CUSTOMERS";
    // Lead permissions
    Permission["VIEW_LEADS"] = "VIEW_LEADS";
    Permission["MANAGE_LEADS"] = "MANAGE_LEADS";
    // Offering permissions
    Permission["VIEW_OFFERINGS"] = "VIEW_OFFERINGS";
    Permission["MANAGE_OFFERINGS"] = "MANAGE_OFFERINGS";
    // Booking permissions
    Permission["VIEW_BOOKINGS"] = "VIEW_BOOKINGS";
    Permission["MANAGE_BOOKINGS"] = "MANAGE_BOOKINGS";
    // Order permissions
    Permission["VIEW_ORDERS"] = "VIEW_ORDERS";
    Permission["MANAGE_ORDERS"] = "MANAGE_ORDERS";
    // Payment permissions
    Permission["VIEW_PAYMENTS"] = "VIEW_PAYMENTS";
    // Analytics permissions
    Permission["VIEW_ANALYTICS"] = "VIEW_ANALYTICS";
    // Knowledge base permissions
    Permission["MANAGE_KNOWLEDGE"] = "MANAGE_KNOWLEDGE";
})(Permission || (Permission = {}));
//# sourceMappingURL=role.enum.js.map