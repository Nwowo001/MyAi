/**
 * @fileoverview Offering, booking, and order domain types.
 *
 * The Offering is the core commercial entity. Everything the business sells
 * is an Offering, regardless of whether it is a product or service.
 */

import type { BookingStatus } from '../enums/bookingStatus.enum';
import type { OrderStatus } from '../enums/orderStatus.enum';

/**
 * An offering is anything a business sells or provides (product or service).
 *
 * Currency uses ISO 4217 codes and is inherited from the business settings.
 * Price is stored as a decimal number (e.g. 5000.00 for ₦5,000).
 */
export interface Offering {
  id: string;
  businessId: string;
  /** PRODUCT | SERVICE */
  type: 'PRODUCT' | 'SERVICE';
  name: string;
  description: string | null;
  /** Price in the business's configured currency */
  price: number;
  /** ISO 4217 currency code — inherited from business.currency */
  currency: string;
  /** Duration in minutes (for appointments/services only) */
  durationMinutes: number | null;
  /** Stock keeping unit identifier (products only) */
  sku: string | null;
  /** Available inventory count (products only) */
  stockQuantity: number | null;
  /** Whether this offering is visible and bookable */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferingInput {
  type: 'PRODUCT' | 'SERVICE';
  name: string;
  description?: string | null;
  price: number;
  currency?: string;
  durationMinutes?: number | null;
  sku?: string | null;
  stockQuantity?: number | null;
  isActive?: boolean;
}

export type UpdateOfferingInput = Partial<Omit<CreateOfferingInput, 'type'>>;

/**
 * A booking for a service, appointment, or event.
 */
export interface Booking {
  id: string;
  businessId: string;
  customerId: string;
  offeringId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  offering?: Pick<Offering, 'id' | 'name' | 'type' | 'price' | 'currency'>;
}

/**
 * A customer order (typically for products or packages).
 */
export interface Order {
  id: string;
  businessId: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentLink: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  offeringId: string;
  quantity: number;
  unitPrice: number;
  offering?: Pick<Offering, 'id' | 'name' | 'type'>;
}

/**
 * A quote generated for a customer.
 */
export interface Quote {
  id: string;
  businessId: string;
  customerId: string;
  offeringId: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
