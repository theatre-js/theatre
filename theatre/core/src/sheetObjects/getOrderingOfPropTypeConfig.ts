import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {
  PropTypeConfig,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'

type EncodedPropPath = string
type Order = number

type Mapping = Map<EncodedPropPath, Order>

const cache = new WeakMap<PropTypeConfig_Compound<$IntentionalAny>, Mapping>()

export default function getOrderingOfPropTypeConfig(
  config: PropTypeConfig_Compound<$IntentionalAny>,
): Mapping {
  const existing = cache.get(config)
  if (existing) return existing

  const map: Mapping = new Map()
  cache.set(config, map)

  iterateOnCompound([], config, map)

  return map
}

function iterateOnCompound(
  path: string[],
  config: PropTypeConfig_Compound<$IntentionalAny>,
  map: Mapping,
) {
  for (const [key, subConf] of Object.entries(config.props)) {
    if (!isPropConfigComposite(subConf)) {
      const subPath = [...path, key]
      map.set(JSON.stringify(subPath), map.size)
      iterateOnAny(subPath, subConf, map)
    }
  }

  for (const [key, subConf] of Object.entries(config.props)) {
    if (isPropConfigComposite(subConf)) {
      const subPath = [...path, key]
      map.set(JSON.stringify(subPath), map.size)
      iterateOnAny(subPath, subConf, map)
    }
  }
}

// function iterateOnEnum(
//   path: string[],
//   config: PropTypeConfig_Enum,
//   map: Mapping,
// ) {
//   for (const [key, subConf] of Object.entries(config.cases)) {
//     const subPath = [...path, key]
//     map.set(JSON.stringify(subPath), map.size)
//     iterateOnAny(subPath, subConf, map)
//   }
// }

function iterateOnAny(path: string[], config: PropTypeConfig, map: Mapping) {
  if (config.type === 'compound') {
    iterateOnCompound(path, config, map)
  } else if (config.type === 'enum') {
    throw new Error(`Enums aren't supported yet`)
  } else {
    map.set(JSON.stringify(path), map.size)
  }
}
