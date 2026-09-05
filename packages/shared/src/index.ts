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
export {
  ConversationStatus,
  ConversationController,
} from './enums/conversationStatus.enum';

export { OfferingType } from './enums/offeringType.enum';

export { PaymentStatus, PaymentProvider } from './enums/paymentStatus.enum';

export { SenderType, MessageType } from './enums/senderType.enum';

export { BusinessRole, Permission } from './enums/role.enum';

export { LeadStatus, LeadSource } from './enums/leadStatus.enum';

export { BookingStatus } from './enums/bookingStatus.enum';

export { OrderStatus } from './enums/orderStatus.enum';

export { Channel } from './enums/channel.enum';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorResponse as ApiError,
  ApiResponse,
  PaginationMeta,
  PaginatedApiResponse,
  ListQueryParams,
} from './types/api.types';

export type {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
  BusinessMember,
  SocialAccount,
  SocialAccountStatus,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UserProfile,
} from './types/business.types';

export type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Lead,
} from './types/customer.types';

export type {
  Conversation,
  Message,
  SendMessageInput,
  ConversationControlInput,
  EscalationEvent,
} from './types/conversation.types';

export type {
  Offering,
  CreateOfferingInput,
  UpdateOfferingInput,
  Booking,
  Order,
  OrderItem,
  Quote,
} from './types/offering.types';

export type {
  Payment,
  GeneratePaymentLinkResult,
  PaymentStatusResult,
} from './types/payment.types';

export type {
  AIMessageRole,
  AIMessage,
  AIToolCall,
  AIToolDefinition,
  AIFinishReason,
  AIUsage,
  AICompletionRequest,
  AICompletionResponse,
  AIProviderErrorInfo,
} from './types/ai.types';
