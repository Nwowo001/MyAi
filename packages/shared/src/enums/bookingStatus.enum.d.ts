/**
 * @fileoverview Booking status enum.
 *
 * Tracks the lifecycle of a service booking or appointment.
 */
/**
 * The current state of a booking.
 */
export declare enum BookingStatus {
    /** Booking created, awaiting payment or confirmation. */
    PENDING = "PENDING",
    /** Booking confirmed (payment received or manual confirmation). */
    CONFIRMED = "CONFIRMED",
    /** The service has been delivered / appointment occurred. */
    COMPLETED = "COMPLETED",
    /** Booking was cancelled before the service date. */
    CANCELLED = "CANCELLED",
    /** Customer did not show up for the appointment. */
    NO_SHOW = "NO_SHOW",
    /** Booking is being rescheduled. */
    RESCHEDULED = "RESCHEDULED"
}
//# sourceMappingURL=bookingStatus.enum.d.ts.map