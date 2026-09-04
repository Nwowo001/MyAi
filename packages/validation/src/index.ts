/**
 * @fileoverview Public API of the @autoagent/validation package.
 *
 * Import schemas from '@autoagent/validation' on both frontend and backend.
 *
 * @example
 * // Backend: validate request body
 * import { CreateBusinessSchema } from '@autoagent/validation';
 * const result = CreateBusinessSchema.safeParse(req.body);
 *
 * @example
 * // Frontend: React Hook Form + Zod resolver
 * import { CreateBusinessSchema } from '@autoagent/validation';
 * const form = useForm({ resolver: zodResolver(CreateBusinessSchema) });
 */

export {
  CurrencyCodeSchema,
  CreateBusinessSchema,
  UpdateBusinessSchema,
} from './business.schema';
export type { CreateBusinessInput, UpdateBusinessInput } from './business.schema';

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
