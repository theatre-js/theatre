/**
 * Using a symbol, we can sort of add unique properties to arbitrary other types.
 * So, we use this to our advantage to add a "marker" of information to strings using
 * the {@link Nominal} type.
 *
 * Can be used with keys in pointers.
 * This identifier shows in the expanded {@link Nominal} as `string & {[nominal]:"SequenceTrackId"}`,
 * So, we're opting to keeping the identifier short.
 */
const nominal = Symbol()

/**
 * This creates an "opaque"/"nominal" type.
 *
 * Our primary use case is to be able to use with keys in pointers.
 *
 * Numbers cannot be added together if they are "nominal"
 *
 * See {@link nominal} for more details.
 */
export type Nominal<N extends string> = string & {[nominal]: N}

declare global {
  // Fix Object.entries and Object.keys definitions for Nominal strict records
  interface ObjectConstructor {
    /** Nominal: Extension to the Object prototype definition to properly manage {@link Nominal} keyed records */
    keys<T extends Record<Nominal<string>, any>>(
      obj: T,
    ): any extends T ? never[] : Extract<keyof T, string>[]
    /** Nominal: Extension to the Object prototype definition to properly manage {@link Nominal} keyed records */
    entries<T extends Record<Nominal<string>, any>>(
      obj: T,
    ): any extends T
      ? [never, never][]
      : Array<{[P in keyof T]: [P, T[P]]}[Extract<keyof T, string>]>
  }
}
