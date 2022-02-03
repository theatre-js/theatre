export type GenericAction = {type: string; payload: unknown}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: unknown,
) => State

export type VoidFn = () => void

export type SerializableMap<
  Primitives extends SerializablePrimitive = SerializablePrimitive,
> = {[Key in string]?: SerializableValue<Primitives>}

/*
 * TODO: For now the rgba primitive type is hard-coded. We should make it proper.
 * What instead we should do is somehow exclude objects where
 * object.type !== 'compound'. One way to do this would be
 *
 * type SerializablePrimitive<T> = T extends {type: 'compound'} ? never : T;
 *
 * const badStuff = {
 *   type: 'compound',
 *   foo: 3,
 * } as const
 *
 * const goodStuff = {
 *   type: 'literallyanythingelse',
 *   foo: 3,
 * } as const
 *
 * function serializeStuff<T>(giveMeStuff: SerializablePrimitive<T>) {
 *   // ...
 * }
 *
 * serializeStuff(badStuff)
 * serializeStuff(goodStuff)
 */
export type SerializablePrimitive =
  | string
  | number
  | boolean
  | {r: number; g: number; b: number; a: number}

export type SerializableValue<
  Primitives extends SerializablePrimitive = SerializablePrimitive,
> = Primitives | SerializableMap

export type DeepPartialOfSerializableValue<T extends SerializableValue> =
  T extends SerializableMap
    ? {
        [K in keyof T]?: DeepPartialOfSerializableValue<
          Exclude<T[K], undefined>
        >
      }
    : T

export type StrictRecord<Key extends string, V> = {[K in Key]?: V}

/**
 * This is supposed to create an "opaque" or "nominal" type, but since typescript
 * doesn't allow generic index signatures, we're leaving it be.
 *
 * TODO fix this once https://github.com/microsoft/TypeScript/pull/26797 lands (likely typescript 4.4)
 */
export type Nominal<T, N extends string> = T

export type IRange<T extends number = number> = {start: T; end: T}

/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

/**
 * Represents the `x` or `y` value of getBoundingClientRect().
 * In other words, represents a distance from 0,0 in screen space.
 */
export type PositionInScreenSpace = Nominal<number, 'ScreenSpaceDim'>
