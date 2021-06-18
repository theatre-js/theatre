import type {$IntentionalAny} from '../types'

/**
 * Useful in type tests, such as: const a: SomeType = _any
 */
export const _any: $IntentionalAny = null

/**
 * Useful in typeTests. If you want to ensure that value v follows type V,
 * just write `expectType<V>(v)`
 */
export const expectType = <T extends unknown>(v: T): T => v
