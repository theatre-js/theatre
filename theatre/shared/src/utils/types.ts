export type GenericAction = {type: string; payload: unknown}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: unknown,
) => State

export type VoidFn = () => void

export type SerializableMap<
  Primitives extends SerializablePrimitive = SerializablePrimitive,
> = {[Key in string]?: SerializableValue<Primitives>}

// TODO: I'm sure we can make this type make more sense
export type SerializablePrimitive = string | number | boolean | {}

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
