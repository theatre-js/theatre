import type {PropTypeConfig} from '@theatre/shared/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getPointerParts} from '@theatre/dataverse'
import React from 'react'
import CompoundPropEditor from './CompoundPropEditor'
import NumberPropEditor from './NumberPropEditor'

/**
 * Returns the PropTypeConfig by path. Assumes `path` is a valid prop path and that
 * it exists in obj.
 */
export const getPropTypeByPointer = (
  pointerToProp: SheetObject['propsP'],
  obj: SheetObject,
): PropTypeConfig => {
  const rootConf = obj.template.config.props

  const p = getPointerParts(pointerToProp).path
  let conf: PropTypeConfig = rootConf as PropTypeConfig

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

const propEditorByPropType: {
  [K in PropTypeConfig['type']]: React.FC<{
    obj: SheetObject
    pointerToProp: SheetObject['propsP']
    propConfig: Extract<PropTypeConfig, {type: K}>
    depth: number
  }>
} = {
  compound: CompoundPropEditor,
  number: NumberPropEditor,
  string: () => <>Implement me</>,
  enum: () => <>Implement me</>,
  boolean: () => <>Implement me</>,
}

const DeterminePropEditor: React.FC<{
  obj: SheetObject
  pointerToProp: SheetObject['propsP']
  propConfig?: PropTypeConfig
  depth: number
}> = (p) => {
  const propConfig =
    p.propConfig ?? getPropTypeByPointer(p.pointerToProp, p.obj)

  const PropEditor = propEditorByPropType[propConfig.type]

  return (
    <PropEditor
      obj={p.obj}
      depth={p.depth}
      pointerToProp={p.pointerToProp}
      // @ts-expect-error This is fine
      propConfig={propConfig}
    />
  )
}

export default DeterminePropEditor
