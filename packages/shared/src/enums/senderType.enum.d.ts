/**
 * @fileoverview Message sender type enum.
 *
 * Identifies who sent a message within a conversation.
 * This is stored on each Message record for display and analytics.
 */
/**
 * The type of entity that sent a message.
 *
 * - CUSTOMER: The end customer communicating through a channel (WhatsApp, etc.)
 * - AI:       The AutoAgent AI system
 * - HUMAN:    A human agent from the business (owner or staff)
 * - SYSTEM:   AutoAgent system messages (e.g. "Conversation assigned to John")
 */
export declare enum SenderType {
    CUSTOMER = "CUSTOMER",
    AI = "AI",
    HUMAN = "HUMAN",
    SYSTEM = "SYSTEM"
}
/**
 * The type of message content.
 */
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    DOCUMENT = "DOCUMENT",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    LOCATION = "LOCATION",
    INTERACTIVE = "INTERACTIVE",
    TEMPLATE = "TEMPLATE",
    SYSTEM = "SYSTEM"
}
//# sourceMappingURL=senderType.enum.d.ts.map