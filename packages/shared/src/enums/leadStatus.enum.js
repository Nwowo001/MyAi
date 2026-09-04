/**
 * @fileoverview Lead status enum.
 *
 * Tracks the progression of a potential customer through the sales funnel.
 */
/**
 * The current status of a lead in the sales funnel.
 *
 * Typical progression:
 * NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → WON / LOST / UNQUALIFIED
 */
export var LeadStatus;
(function (LeadStatus) {
    /** Newly captured lead, no action taken yet. */
    LeadStatus["NEW"] = "NEW";
    /** The lead has been contacted (by AI or human). */
    LeadStatus["CONTACTED"] = "CONTACTED";
    /** The lead has been qualified as a genuine prospect. */
    LeadStatus["QUALIFIED"] = "QUALIFIED";
    /** A quote or proposal has been sent to the lead. */
    LeadStatus["PROPOSAL_SENT"] = "PROPOSAL_SENT";
    /** The lead converted into a paying customer. */
    LeadStatus["WON"] = "WON";
    /** The lead did not convert (chose a competitor, not ready, etc.). */
    LeadStatus["LOST"] = "LOST";
    /** The lead was found to be unsuitable for the business offerings. */
    LeadStatus["UNQUALIFIED"] = "UNQUALIFIED";
})(LeadStatus || (LeadStatus = {}));
/**
 * How a lead was acquired.
 */
export var LeadSource;
(function (LeadSource) {
    LeadSource["WHATSAPP"] = "WHATSAPP";
    LeadSource["WEBSITE"] = "WEBSITE";
    LeadSource["INSTAGRAM"] = "INSTAGRAM";
    LeadSource["FACEBOOK"] = "FACEBOOK";
    LeadSource["REFERRAL"] = "REFERRAL";
    LeadSource["MANUAL"] = "MANUAL";
    LeadSource["OTHER"] = "OTHER";
})(LeadSource || (LeadSource = {}));
//# sourceMappingURL=leadStatus.enum.js.map