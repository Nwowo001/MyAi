/**
 * @fileoverview Messaging channel enum.
 *
 * AutoAgent uses a channel adapter architecture. All supported channels
 * are enumerated here. The MVP supports WhatsApp only; additional channels
 * can be enabled in future phases by implementing the ChannelAdapter interface.
 */
/**
 * Supported messaging channels.
 *
 * MVP: WHATSAPP only.
 * Future: INSTAGRAM, FACEBOOK, WEBSITE_CHAT, SMS, EMAIL.
 */
export declare enum Channel {
    WHATSAPP = "WHATSAPP",
    /** Future channels — implement ChannelAdapter to activate */
    INSTAGRAM = "INSTAGRAM",
    FACEBOOK = "FACEBOOK",
    WEBSITE_CHAT = "WEBSITE_CHAT",
    SMS = "SMS",
    EMAIL = "EMAIL"
}
//# sourceMappingURL=channel.enum.d.ts.map