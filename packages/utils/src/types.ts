/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

/** temporary any type until we move all of studio's types to core */
export type $____FixmeStudio = any

export type VoidFn = () => void

/**
 * This is equivalent to `Partial<Record<Key, V>>` being used to describe a sort of Map
 * where the keys might not have values.
 *
 * We do not use `Map`s or `Set`s, because they add complexity with converting to
 * `JSON.stringify` + pointer types.
 */
export type StrictRecord<Key extends string, V> = {[K in Key]?: V}
