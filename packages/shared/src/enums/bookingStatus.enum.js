/**
 * @fileoverview Booking status enum.
 *
 * Tracks the lifecycle of a service booking or appointment.
 */
/**
 * The current state of a booking.
 */
export var BookingStatus;
(function (BookingStatus) {
    /** Booking created, awaiting payment or confirmation. */
    BookingStatus["PENDING"] = "PENDING";
    /** Booking confirmed (payment received or manual confirmation). */
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    /** The service has been delivered / appointment occurred. */
    BookingStatus["COMPLETED"] = "COMPLETED";
    /** Booking was cancelled before the service date. */
    BookingStatus["CANCELLED"] = "CANCELLED";
    /** Customer did not show up for the appointment. */
    BookingStatus["NO_SHOW"] = "NO_SHOW";
    /** Booking is being rescheduled. */
    BookingStatus["RESCHEDULED"] = "RESCHEDULED";
})(BookingStatus || (BookingStatus = {}));
//# sourceMappingURL=bookingStatus.enum.js.map