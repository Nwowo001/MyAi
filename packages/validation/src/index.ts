/**
 * @fileoverview Public API of the @autoagent/validation package.
 *
 * Import schemas from '@autoagent/validation' on both frontend and backend.
 */

export {
  CreateBusinessSchema,
  UpdateBusinessSchema,
  InviteMemberSchema,
  UpdateMemberRoleSchema,
} from './business.schema';
export type {
  CreateBusinessSchemaType,
  UpdateBusinessSchemaType,
  InviteMemberSchemaType,
  UpdateMemberRoleSchemaType,
} from './business.schema';

export { CreateOfferingSchema, UpdateOfferingSchema } from './offering.schema';
export type { CreateOfferingInput, UpdateOfferingInput } from './offering.schema';

export { CreateCustomerSchema, UpdateCustomerSchema } from './customer.schema';
export type { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';

export {
  SendMessageSchema,
  ConversationControlSchema,
  ListConversationsSchema,
} from './conversation.schema';
export type { SendMessageInput, ConversationControlInput } from './conversation.schema';

export { CreateBookingSchema, UpdateBookingSchema } from './booking.schema';
export type { CreateBookingInput, UpdateBookingInput } from './booking.schema';

export { CreateOrderSchema, OrderItemSchema } from './order.schema';
export type { CreateOrderInput, OrderItemInput } from './order.schema';

export { CreateKnowledgeSchema, UpdateKnowledgeSchema } from './knowledge.schema';
export type { CreateKnowledgeInput, UpdateKnowledgeInput } from './knowledge.schema';
