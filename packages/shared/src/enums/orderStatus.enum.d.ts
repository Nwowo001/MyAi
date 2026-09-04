/**
 * @fileoverview Order status enum.
 *
 * Tracks the lifecycle of a product or service order.
 */
/**
 * The current state of an order.
 *
 * Transitions:
 * PENDING_PAYMENT → PAID → PROCESSING → READY / SHIPPED → DELIVERED → COMPLETED
 *       │                                                               │
 *       └──────────────────────────────────────────────────────────►  CANCELLED
 */
export declare enum OrderStatus {
    /** Order created; waiting for payment. */
    PENDING_PAYMENT = "PENDING_PAYMENT",
    /** Payment received; awaiting processing. */
    PAID = "PAID",
    /** Business is processing / preparing the order. */
    PROCESSING = "PROCESSING",
    /** Order is ready for pickup (for physical goods / in-store). */
    READY = "READY",
    /** Order has been shipped (for delivery orders). */
    SHIPPED = "SHIPPED",
    /** Order delivered to the customer. */
    DELIVERED = "DELIVERED",
    /** Order fully completed. */
    COMPLETED = "COMPLETED",
    /** Order was cancelled. */
    CANCELLED = "CANCELLED",
    /** A refund has been issued. */
    REFUNDED = "REFUNDED"
}
//# sourceMappingURL=orderStatus.enum.d.ts.map