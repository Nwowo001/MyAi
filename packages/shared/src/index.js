/**
 * @fileoverview Public API of the @autoagent/shared package.
 *
 * This file re-exports everything that external packages (apps/web, apps/api)
 * need from the shared package. Import from '@autoagent/shared' — not from
 * internal paths — to ensure refactoring is safe.
 *
 * @example
 * import { ConversationStatus, type Conversation } from '@autoagent/shared';
 */
// ── Enums ─────────────────────────────────────────────────────────────────────
export { ConversationStatus, ConversationController, } from './enums/conversationStatus.enum';
export { OfferingType } from './enums/offeringType.enum';
export { PaymentStatus, PaymentProvider } from './enums/paymentStatus.enum';
export { SenderType, MessageType } from './enums/senderType.enum';
export { BusinessRole, Permission } from './enums/role.enum';
export { LeadStatus, LeadSource } from './enums/leadStatus.enum';
export { BookingStatus } from './enums/bookingStatus.enum';
export { OrderStatus } from './enums/orderStatus.enum';
export { Channel } from './enums/channel.enum';
//# sourceMappingURL=index.js.map