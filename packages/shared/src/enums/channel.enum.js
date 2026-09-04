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
export var Channel;
(function (Channel) {
    Channel["WHATSAPP"] = "WHATSAPP";
    /** Future channels — implement ChannelAdapter to activate */
    Channel["INSTAGRAM"] = "INSTAGRAM";
    Channel["FACEBOOK"] = "FACEBOOK";
    Channel["WEBSITE_CHAT"] = "WEBSITE_CHAT";
    Channel["SMS"] = "SMS";
    Channel["EMAIL"] = "EMAIL";
})(Channel || (Channel = {}));
//# sourceMappingURL=channel.enum.js.map