import type {
  IBasePropType,
  PropTypeConfig,
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

export function isPropConfigComposite(
  c: PropTypeConfig,
): c is PropTypeConfig_Compound<{}> | PropTypeConfig_Enum {
  return c.type === 'compound' || c.type === 'enum'
}

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

export function isPropConfSequencable(
  conf: PropTypeConfig,
): conf is Extract<PropTypeConfig, {interpolate: any}> {
  return !isPropConfigComposite(conf) // now all non-compounds are sequencable
}

const compoundPropSequenceabilityCache = new WeakMap<
  PropTypeConfig_Compound<{}> | PropTypeConfig_Enum,
  boolean
>()

/**
 * See {@link compoundHasSimpleDescendantsImpl}
 */
export function compoundHasSimpleDescendants(
  conf: PropTypeConfig_Compound<{}> | PropTypeConfig_Enum,
): boolean {
  if (!compoundPropSequenceabilityCache.has(conf)) {
    compoundPropSequenceabilityCache.set(
      conf,
      compoundHasSimpleDescendantsImpl(conf),
    )
  }

  return compoundPropSequenceabilityCache.get(conf)!
}

/**
 * This basically checks of the compound prop has at least one simple prop in its descendants.
 * In other words, if the compound props has no subs, or its subs are only compounds that eventually
 * don't have simple subs, this will return false.
 */
function compoundHasSimpleDescendantsImpl(
  conf: PropTypeConfig_Compound<{}> | PropTypeConfig_Enum,
): boolean {
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
}

export function* iteratePropType(
  conf: PropTypeConfig,
  pathUpToThisPoint: PathToProp,
): Generator<{path: PathToProp; conf: PropTypeConfig}, void, void> {
  if (conf.type === 'compound') {
    for (const key in conf.props) {
      yield* iteratePropType(conf.props[key] as PropTypeConfig, [
        ...pathUpToThisPoint,
        key,
      ])
    }
  } else if (conf.type === 'enum') {
    throw new Error(`Not implemented yet`)
  } else {
    return yield {path: pathUpToThisPoint, conf}
  }
}
