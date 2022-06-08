import type {
  IBasePropType,
  PropTypeConfig_AllSimples,
} from '@theatre/core/propTypes'
import React, {useMemo} from 'react'
import {getEditingToolsForSimplePropInDetailsPanel} from '@theatre/studio/propEditors/useEditingToolsForSimpleProp'
import {SingleRowPropEditor} from '@theatre/studio/panels/DetailPanel/DeterminePropEditorForDetail/SingleRowPropEditor'
import type {Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'

export type IDetailSimplePropEditorProps<
  TPropTypeConfig extends IBasePropType<string, any>,
> = {
  propConfig: TPropTypeConfig
  pointerToProp: Pointer<TPropTypeConfig['valueType']>
  obj: SheetObject
  visualIndentation: number
  SimpleEditorComponent: React.VFC<ISimplePropEditorReactProps<TPropTypeConfig>>
}

/**
 * Shown in the Object details panel, changes to this editor are usually reflected at either
 * the playhead position (the `sequence.position`) or if static, the static override value.
 */
function DetailSimplePropEditor<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
>({
  propConfig,
  pointerToProp,
  obj,
  SimpleEditorComponent: EditorComponent,
}: IDetailSimplePropEditorProps<TPropTypeConfig>) {
  const editingToolsD = useMemo(
    () =>
      getEditingToolsForSimplePropInDetailsPanel(
        pointerToProp,
        obj,
        propConfig,
      ),
    [propConfig],
  )

  return (
    <SingleRowPropEditor {...{editingToolsD, propConfig, pointerToProp}}>
      <EditorComponent
        editingToolsD={editingToolsD}
        propConfig={propConfig}
        valueD={prism(() => editingToolsD.getValue().value.getValue())}
      />
    </SingleRowPropEditor>
  )
}

export default DetailSimplePropEditor
