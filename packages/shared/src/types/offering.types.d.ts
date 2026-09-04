/**
 * @fileoverview Offering, booking, and order domain types.
 *
 * The Offering is the core commercial entity. Everything the business sells
 * is an Offering, regardless of whether it is a product, service, appointment,
 * package, or subscription.
 */
import type { OfferingType } from '../enums/offeringType.enum';
import type { BookingStatus } from '../enums/bookingStatus.enum';
import type { OrderStatus } from '../enums/orderStatus.enum';
/**
 * An offering is anything a business sells or provides.
 *
 * Currency uses ISO 4217 codes and is inherited from the business settings.
 * Price is stored as a number in the smallest relevant unit (e.g. kobo for NGN).
 */
export interface Offering {
    id: string;
    businessId: string;
    type: OfferingType;
    name: string;
    description: string | null;
    /** Price in the business's configured currency units */
    price: number | null;
    /** ISO 4217 currency code — inherited from business.currency */
    currency: string;
    /** Duration in minutes (for appointments/services) */
    duration: number | null;
    /** Availability config (JSON, structure depends on offering type) */
    availability: Record<string, unknown> | null;
    active: boolean;
    /** Additional metadata specific to the offering type */
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export interface CreateOfferingInput {
    type: OfferingType;
    name: string;
    description?: string;
    price?: number;
    duration?: number;
    availability?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export type UpdateOfferingInput = Partial<CreateOfferingInput> & {
    active?: boolean;
};
/**
 * A booking for a service, appointment, or event.
 */
export interface Booking {
    id: string;
    businessId: string;
    customerId: string;
    offeringId: string;
    assignedUserId: string | null;
    startTime: string;
    endTime: string | null;
    status: BookingStatus;
    notes: string | null;
    metadata: Record<string, unknown>;
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
    totalPrice: number;
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
//# sourceMappingURL=offering.types.d.ts.map