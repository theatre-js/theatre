/**
 * All errors thrown to end-users should be an instance of this class.
 */
export class TheatreError extends Error {}

/**
 * If an end-user provided an invalid argument to a public API, the error thrown
 * should be an instance of this class.
 */
export class InvalidArgumentError extends TheatreError {}
