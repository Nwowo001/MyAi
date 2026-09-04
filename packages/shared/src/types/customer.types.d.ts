/**
 * @fileoverview Customer and lead domain types.
 */
/**
 * A customer who has interacted with a business through AutoAgent.
 */
export interface Customer {
    id: string;
    businessId: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    /** Flexible key-value store for additional customer data */
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCustomerInput {
    name?: string;
    phone?: string;
    email?: string;
    metadata?: Record<string, unknown>;
}
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
/**
 * A sales lead associated with a customer.
 * A customer may have multiple leads over time.
 */
export interface Lead {
    id: string;
    businessId: string;
    customerId: string;
    status: string;
    source: string;
    /** Structured data collected during AI qualification */
    qualificationData: Record<string, unknown>;
    score: number | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    customer?: Customer;
}
//# sourceMappingURL=customer.types.d.ts.map