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
 *
 * However this wouldn't protect against other unserializable stuff, or nested
 * unserializable stuff, since using mapped types seem to break it for some reason.
 *
 * TODO: Consider renaming to `SerializableSimple` if this should be aligned with "simple props".
 */
export type SerializablePrimitive =
  | string
  | number
  | boolean
  | {r: number; g: number; b: number; a: number}

/**
 * This type represents all values that can be safely serialized.
 * Also, it's notable that this type is compatible for dataverse pointer traversal (everything
 * is path accessible [e.g. `a.b.c`]).
 *
 * One example usage is for keyframe values or static overrides such as `Rgba`, `string`, `number`, and "compound values".
 */
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

/**
 * This is equivalent to `Partial<Record<Key, V>>` being used to describe a sort of Map
 * where the keys might not have values.
 *
 * We do not use `Map`s or `Set`s, because they add complexity with converting to
 * `JSON.stringify` + pointer types.
 */
export type StrictRecord<Key extends string, V> = {[K in Key]?: V}

/**
 * TODO: We should deprecate this and just use `[start: number, end: number]`
 */
export type IRange<T extends number = number> = {start: T; end: T}

/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

/**
 * Represents the `x` or `y` value of getBoundingClientRect().
 * In other words, represents a distance from 0,0 in screen space.
 */
export type PositionInScreenSpace = number
