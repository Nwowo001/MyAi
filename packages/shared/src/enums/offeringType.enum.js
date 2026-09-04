/**
 * @fileoverview Offering type enum.
 *
 * An Offering is the core commercial entity in AutoAgent. It represents anything
 * a business sells or provides. The OfferingType discriminates between different
 * forms of offerings so the system can apply appropriate logic (e.g. availability
 * checking for appointments, inventory for products, etc.).
 */
/**
 * The type of an offering.
 *
 * - PRODUCT:      A physical or digital item that can be purchased (has inventory).
 * - SERVICE:      A provided service, typically performed by a person.
 * - PACKAGE:      A bundle of multiple products/services sold together.
 * - APPOINTMENT:  A time-bound service session (e.g. consultation, meeting).
 * - SUBSCRIPTION: A recurring offering charged on a schedule.
 * - OTHER:        Catch-all for custom business-specific offering types.
 */
export var OfferingType;
(function (OfferingType) {
    OfferingType["PRODUCT"] = "PRODUCT";
    OfferingType["SERVICE"] = "SERVICE";
    OfferingType["PACKAGE"] = "PACKAGE";
    OfferingType["APPOINTMENT"] = "APPOINTMENT";
    OfferingType["SUBSCRIPTION"] = "SUBSCRIPTION";
    OfferingType["OTHER"] = "OTHER";
})(OfferingType || (OfferingType = {}));
//# sourceMappingURL=offeringType.enum.js.map