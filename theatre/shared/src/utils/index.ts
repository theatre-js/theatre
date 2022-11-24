/**
 * This is just an empty object used in place of `{}` when you want to:
 * 1. Not create many new objects (less GC pressure)
 * 2. Have the empty object be a singleton (so that `===` works), so it can be fed to memoized functions.
 */
export const emptyObject = {}

/**
 * The array equivalent of {@link emptyObject}.
 */
export const emptyArray: ReadonlyArray<unknown> = []
