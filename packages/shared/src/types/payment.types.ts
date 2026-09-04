/**
 * @fileoverview Payment domain types.
 *
 * IMPORTANT SECURITY NOTE:
 * Payment status must ONLY be updated by the backend after verifying
 * a Paystack webhook. Never trust payment status from the frontend, AI,
 * or customer messages (e.g. "I've sent the money").
 */

import type { PaymentStatus, PaymentProvider } from '../enums/paymentStatus.enum';

/**
 * A payment record.
 * Created when a payment link is generated; updated when Paystack confirms.
 */
export interface Payment {
  id: string;
  businessId: string;
  customerId: string;
  orderId: string | null;
  bookingId: string | null;
  provider: PaymentProvider;
  /** External reference from the payment provider */
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** ISO timestamp of when the payment was completed */
  paidAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Result of generating a payment link.
 */
export interface GeneratePaymentLinkResult {
  paymentId: string;
  reference: string;
  /** The URL to send to the customer */
  authorizationUrl: string;
  /** When the link expires */
  expiresAt: string | null;
}

/**
 * Payment status check result (returned by AI tool checkPaymentStatus).
 */
export interface PaymentStatusResult {
  paymentId: string;
  reference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: string | null;
}
