/**
 * @fileoverview Conversation status and controller enums.
 *
 * These enums define the full state machine for a conversation in AutoAgent.
 *
 * State machine:
 *
 *   AI_ACTIVE ──► HUMAN_REQUESTED ──► HUMAN_ACTIVE ──► RESOLVED
 *        ▲                                  │               │
 *        └────────── AI_RESUMED ────────────┘               │
 *                                                           │
 *   CLOSED ◄───────────────────────────────────────────────┘
 *
 * New inbound message after RESOLVED → conversation reopens to AI_ACTIVE.
 */
/**
 * The current status of a conversation.
 *
 * Transitions:
 * - AI_ACTIVE          → HUMAN_REQUESTED (AI escalates or customer requests human)
 * - AI_ACTIVE          → WAITING_FOR_CUSTOMER (AI sent a message, waiting for reply)
 * - HUMAN_REQUESTED    → HUMAN_ACTIVE (human agent accepts the conversation)
 * - HUMAN_ACTIVE       → AI_RESUMED (human hands back to AI)
 * - HUMAN_ACTIVE       → RESOLVED (human resolves the issue)
 * - AI_RESUMED         → HUMAN_REQUESTED (AI may re-escalate)
 * - AI_RESUMED         → RESOLVED
 * - RESOLVED           → AI_ACTIVE (customer sends new message — configurable)
 * - Any                → CLOSED (manual/admin action)
 */
export var ConversationStatus;
(function (ConversationStatus) {
    /** AI is actively handling the conversation. */
    ConversationStatus["AI_ACTIVE"] = "AI_ACTIVE";
    /** AI has determined human intervention is needed; waiting for a human to accept. */
    ConversationStatus["HUMAN_REQUESTED"] = "HUMAN_REQUESTED";
    /** A human agent is actively handling the conversation. */
    ConversationStatus["HUMAN_ACTIVE"] = "HUMAN_ACTIVE";
    /** AI is waiting for a customer reply (no pending action required from business). */
    ConversationStatus["WAITING_FOR_CUSTOMER"] = "WAITING_FOR_CUSTOMER";
    /** Human has handed control back to the AI. */
    ConversationStatus["AI_RESUMED"] = "AI_RESUMED";
    /** The conversation issue has been resolved. */
    ConversationStatus["RESOLVED"] = "RESOLVED";
    /** The conversation is permanently closed (archived). */
    ConversationStatus["CLOSED"] = "CLOSED";
})(ConversationStatus || (ConversationStatus = {}));
/**
 * Which entity currently controls the customer-facing side of the conversation.
 *
 * This is separate from ConversationStatus because during HUMAN_ACTIVE,
 * the AI still operates internally in copilot mode — it just doesn't
 * send customer-facing messages.
 */
export var ConversationController;
(function (ConversationController) {
    /** AI is sending customer-facing responses. */
    ConversationController["AI"] = "AI";
    /** A human agent is sending customer-facing responses. */
    ConversationController["HUMAN"] = "HUMAN";
    /** No one is actively responding (e.g. RESOLVED or CLOSED state). */
    ConversationController["NONE"] = "NONE";
})(ConversationController || (ConversationController = {}));
//# sourceMappingURL=conversationStatus.enum.js.map