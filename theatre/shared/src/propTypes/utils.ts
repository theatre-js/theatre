import type {
  IBasePropType,
  PropTypeConfig,
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import memoizeFn from '@theatre/shared/utils/memoizeFn'

/**
 * Either compound or enum properties can be considered "composite"
 * */
export function isPropConfigComposite(
  c: PropTypeConfig,
): c is PropTypeConfig_Compound<{}> | PropTypeConfig_Enum {
  return c.type === 'compound' || c.type === 'enum'
}

/**
 * Returns the prop config at the given path. Traverses composite props until
 * it reaches the deepest prop config. Returns `undefined` if none is found.
 *
 * This is _NOT_ type-safe, so use with caution.
 */
export function getPropConfigByPath(
  parentConf: PropTypeConfig | undefined,
  path: PathToProp,
): undefined | PropTypeConfig {
  if (!parentConf) return undefined
  const [key, ...rest] = path
  if (key === undefined) return parentConf
  if (!isPropConfigComposite(parentConf)) return undefined

  const sub =
    parentConf.type === 'enum'
      ? parentConf.cases[key]
      : (parentConf as $IntentionalAny).props[key]

  return getPropConfigByPath(sub, rest)
}

/**
 * @param value - An arbitrary value. May be matching the prop's type or not
 * @param propConfig - The configuration object for a prop
 * @returns value if it matches the prop's type
 * otherwise returns the default value for the prop
 */
export function valueInProp<PropConfig extends PropTypeConfig_AllSimples>(
  value: unknown,
  propConfig: PropConfig,
): PropConfig extends IBasePropType<$IntentionalAny, $IntentionalAny, infer T>
  ? T
  : never {
  const sanitizedVal = propConfig.deserializeAndSanitize(value)
  if (sanitizedVal === undefined) {
    return propConfig.default
  } else {
    return sanitizedVal
  }
}

/**
 * Returns true if the prop can be sequenced according to its config. This basically returns false for composite props,
 * and true for everything else.
 */
export function isPropConfSequencable(
  conf: PropTypeConfig,
): conf is Extract<PropTypeConfig, {interpolate: any}> {
  return !isPropConfigComposite(conf) // now all non-compounds are sequencable
}

/**
 * This basically checks of the compound prop has at least one simple prop in its descendants.
 * In other words, if the compound props has no subs, or its subs are only compounds that eventually
 * don't have simple subs, this will return false.
 */
export const compoundHasSimpleDescendants = memoizeFn(
  (conf: PropTypeConfig_Compound<{}> | PropTypeConfig_Enum): boolean => {
    if (conf.type === 'enum') {
      throw new Error(`Not implemented yet for enums`)
    }

    for (const key in conf.props) {
      const subConf = conf.props[
        key as $IntentionalAny as keyof typeof conf.props
      ] as PropTypeConfig
      if (isPropConfigComposite(subConf)) {
        if (compoundHasSimpleDescendants(subConf)) {
          return true
        }
      } else {
        return true
      }
    }
    return false
  },
)

/**
 * Iterates recursively over the simple props of a compound prop. Returns a generator.
 *
 *
 * @param conf - The prop config
 * @param pathPrefix - The path prefix to prepend to the paths of the props
 * @returns A generator that yields the path and the config of each simple prop
 *
 *  * Example:
 * ```ts
 * const conf = types.compound({a: {b: 1, c: {d: 2}}})
 * for (const {path, conf} of iteratePropType(conf, ['foo'])) {
 *   console.log({path, conf})
 * }
 * // logs:
 * // {path: ['foo', 'a', 'b'], conf: {type: 'number', default: 1}}
 * // {path: ['foo', 'a', 'c', 'd'], conf: {type: 'number', default: 2}}
 * ```
 */
export function* iteratePropType(
  conf: PropTypeConfig,
  pathPrefix: PathToProp,
): Generator<{path: PathToProp; conf: PropTypeConfig}, void, void> {
  if (conf.type === 'compound') {
    for (const key in conf.props) {
      yield* iteratePropType(conf.props[key] as PropTypeConfig, [
        ...pathPrefix,
        key,
      ])
    }
  } else if (conf.type === 'enum') {
    throw new Error(`Not implemented yet`)
  } else {
    return yield {path: pathPrefix, conf}
  }
}
