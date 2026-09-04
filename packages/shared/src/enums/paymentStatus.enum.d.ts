/**
 * @fileoverview Payment status enum.
 *
 * Represents the lifecycle of a payment in AutoAgent.
 *
 * IMPORTANT: Payment status must ONLY be updated by the backend after
 * verifying a Paystack webhook or polling the Paystack API.
 * Never accept payment status claims from the frontend or from the AI.
 */
/**
 * The current state of a payment record.
 *
 * Transitions:
 * - PENDING   → SUCCESS (Paystack webhook received + backend verified)
 * - PENDING   → FAILED (Paystack reports failure)
 * - PENDING   → CANCELLED (user abandoned / link expired)
 * - SUCCESS   → REFUNDED (refund issued via Paystack)
 */
export declare enum PaymentStatus {
    /** Payment link generated; awaiting customer payment. */
    PENDING = "PENDING",
    /** Payment completed and verified by the backend. */
    SUCCESS = "SUCCESS",
    /** Payment attempt failed (insufficient funds, card declined, etc.). */
    FAILED = "FAILED",
    /** Customer abandoned the payment or the link expired. */
    CANCELLED = "CANCELLED",
    /** Payment was successfully refunded to the customer. */
    REFUNDED = "REFUNDED"
}
/**
 * Supported payment providers.
 * Add new providers here as integrations are added.
 */
export declare enum PaymentProvider {
    PAYSTACK = "PAYSTACK"
}
//# sourceMappingURL=paymentStatus.enum.d.ts.map