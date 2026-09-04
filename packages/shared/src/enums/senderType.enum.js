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
export var SenderType;
(function (SenderType) {
    SenderType["CUSTOMER"] = "CUSTOMER";
    SenderType["AI"] = "AI";
    SenderType["HUMAN"] = "HUMAN";
    SenderType["SYSTEM"] = "SYSTEM";
})(SenderType || (SenderType = {}));
/**
 * The type of message content.
 */
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["DOCUMENT"] = "DOCUMENT";
    MessageType["AUDIO"] = "AUDIO";
    MessageType["VIDEO"] = "VIDEO";
    MessageType["LOCATION"] = "LOCATION";
    MessageType["INTERACTIVE"] = "INTERACTIVE";
    MessageType["TEMPLATE"] = "TEMPLATE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=senderType.enum.js.map