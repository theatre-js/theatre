import type {SheetObjectPropTypeConfig} from '@theatre/core/sheets/TheatreSheet'
import type {
  $FixMe,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
import type {
  PropTypeConfig,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
} from '@theatre/core/propTypes'

const cachedDefaults = new WeakMap<PropTypeConfig, SerializableValue>()

/**
 * Generates and caches a default value for the config of a SheetObject.
 */
export default function getPropDefaultsOfSheetObject(
  config: SheetObjectPropTypeConfig,
): SerializableMap {
  return getDefaultsOfPropTypeConfig(config) as SerializableMap // sheet objects result in non-primitive objects
}

function getDefaultsOfPropTypeConfig(
  config: PropTypeConfig,
): SerializableValue {
  if (cachedDefaults.has(config)) {
    return cachedDefaults.get(config)!
  }

  const generated =
    config.type === 'compound'
      ? generateDefaultsForCompound(config)
      : config.type === 'enum'
      ? generateDefaultsForEnum(config)
      : config.default

  cachedDefaults.set(config, generated)

  return generated
}

function generateDefaultsForEnum(config: PropTypeConfig_Enum) {
  const defaults: SerializableMap = {
    $case: config.defaultCase,
  }

  for (const [case_, caseConf] of Object.entries(config.cases)) {
    defaults[case_] = getDefaultsOfPropTypeConfig(caseConf)
  }

  return defaults
}

function generateDefaultsForCompound(config: PropTypeConfig_Compound<$FixMe>) {
  const defaults: SerializableMap = {}
  for (const [key, propConf] of Object.entries(config.props)) {
    defaults[key] = getDefaultsOfPropTypeConfig(propConf)
  }

  return defaults
}
