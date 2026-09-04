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
export declare enum LeadStatus {
    /** Newly captured lead, no action taken yet. */
    NEW = "NEW",
    /** The lead has been contacted (by AI or human). */
    CONTACTED = "CONTACTED",
    /** The lead has been qualified as a genuine prospect. */
    QUALIFIED = "QUALIFIED",
    /** A quote or proposal has been sent to the lead. */
    PROPOSAL_SENT = "PROPOSAL_SENT",
    /** The lead converted into a paying customer. */
    WON = "WON",
    /** The lead did not convert (chose a competitor, not ready, etc.). */
    LOST = "LOST",
    /** The lead was found to be unsuitable for the business offerings. */
    UNQUALIFIED = "UNQUALIFIED"
}
/**
 * How a lead was acquired.
 */
export declare enum LeadSource {
    WHATSAPP = "WHATSAPP",
    WEBSITE = "WEBSITE",
    INSTAGRAM = "INSTAGRAM",
    FACEBOOK = "FACEBOOK",
    REFERRAL = "REFERRAL",
    MANUAL = "MANUAL",
    OTHER = "OTHER"
}
//# sourceMappingURL=leadStatus.enum.d.ts.map