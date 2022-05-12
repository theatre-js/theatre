import type {PropTypeConfig} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getPointerParts} from '@theatre/dataverse'

/**
 * Returns the PropTypeConfig by path. Assumes `path` is a valid prop path and that
 * it exists in obj.
 *
 * Example usage:
 * ```
 * const propConfig = getPropTypeByPointer(propP, sheetObject)
 *
 * if (propConfig.type === 'number') {
 * //... etc.
 * }
 * ```
 */

export function getPropTypeByPointer(
  pointerToProp: SheetObject['propsP'],
  obj: SheetObject,
): PropTypeConfig {
  const rootConf = obj.template.config

  const p = getPointerParts(pointerToProp).path
  let conf = rootConf as PropTypeConfig

  while (p.length !== 0) {
    const key = p.shift()
    if (typeof key === 'string') {
      if (conf.type === 'compound') {
        conf = conf.props[key]
        if (!conf) {
          throw new Error(
            `getPropTypeConfigByPath() is called with an invalid path.`,
          )
        }
      } else if (conf.type === 'enum') {
        conf = conf.cases[key]
        if (!conf) {
          throw new Error(
            `getPropTypeConfigByPath() is called with an invalid path.`,
          )
        }
      } else {
        throw new Error(
          `getPropTypeConfigByPath() is called with an invalid path.`,
        )
      }
    } else if (typeof key === 'number') {
      throw new Error(`Number indexes are not implemented yet. @todo`)
    } else {
      throw new Error(
        `getPropTypeConfigByPath() is called with an invalid path.`,
      )
    }
  }

  return conf
}
