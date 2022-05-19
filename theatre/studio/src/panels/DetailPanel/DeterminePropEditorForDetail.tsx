import React from 'react'
import type {Pointer} from '@theatre/dataverse'
import type {
  PropTypeConfig,
  PropTypeConfig_AllSimples,
} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getPropTypeByPointer} from '@theatre/studio/propEditors/utils/getPropTypeByPointer'
import {simplePropEditorByPropType} from '@theatre/studio/propEditors/simpleEditors/simplePropEditorByPropType'
import type {PropConfigForType} from '@theatre/studio/propEditors/utils/PropConfigForType'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import DetailCompoundPropEditor from './DeterminePropEditorForDetail/DetailCompoundPropEditor'
import DetailSimplePropEditor from './DeterminePropEditorForDetail/DetailSimplePropEditor'

/**
 * Given a propConfig, this function gives the corresponding prop editor for
 * use in the details panel. {@link DeterminePropEditorForKeyframe} does the
 * same thing for the dope sheet inline prop editor on a keyframe. The main difference
 * between this function and {@link DeterminePropEditorForKeyframe} is that this
 * one shows prop editors *with* keyframe navigation controls (that look
 * like `< ・ >`).
 *
 * @param p - propConfig object for any type of prop.
 */
const DeterminePropEditorForDetail: React.VFC<
  IDeterminePropEditorForDetailProps<PropTypeConfig['type']>
> = (p) => {
  const propConfig =
    p.propConfig ?? getPropTypeByPointer(p.pointerToProp, p.obj)

  if (propConfig.type === 'compound') {
    return (
      <DetailCompoundPropEditor
        obj={p.obj}
        visualIndentation={p.visualIndentation}
        pointerToProp={p.pointerToProp}
        propConfig={propConfig}
      />
    )
  } else if (propConfig.type === 'enum') {
    // notice: enums are not implemented, yet.
    return <></>
  } else {
    const PropEditor = simplePropEditorByPropType[propConfig.type]

    return (
      <DetailSimplePropEditor
        SimpleEditorComponent={
          PropEditor as React.VFC<
            ISimplePropEditorReactProps<PropTypeConfig_AllSimples>
          >
        }
        obj={p.obj}
        visualIndentation={p.visualIndentation}
        pointerToProp={p.pointerToProp}
        propConfig={propConfig}
      />
    )
  }
}

export default DeterminePropEditorForDetail
type IDeterminePropEditorForDetailProps<K extends PropTypeConfig['type']> =
  IDetailEditablePropertyProps<K> & {
    visualIndentation: number
  }
type IDetailEditablePropertyProps<K extends PropTypeConfig['type']> = {
  obj: SheetObject
  pointerToProp: Pointer<PropConfigForType<K>['valueType']>
  propConfig: PropConfigForType<K>
}
