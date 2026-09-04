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
export var OrderStatus;
(function (OrderStatus) {
    /** Order created; waiting for payment. */
    OrderStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    /** Payment received; awaiting processing. */
    OrderStatus["PAID"] = "PAID";
    /** Business is processing / preparing the order. */
    OrderStatus["PROCESSING"] = "PROCESSING";
    /** Order is ready for pickup (for physical goods / in-store). */
    OrderStatus["READY"] = "READY";
    /** Order has been shipped (for delivery orders). */
    OrderStatus["SHIPPED"] = "SHIPPED";
    /** Order delivered to the customer. */
    OrderStatus["DELIVERED"] = "DELIVERED";
    /** Order fully completed. */
    OrderStatus["COMPLETED"] = "COMPLETED";
    /** Order was cancelled. */
    OrderStatus["CANCELLED"] = "CANCELLED";
    /** A refund has been issued. */
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (OrderStatus = {}));
//# sourceMappingURL=orderStatus.enum.js.map