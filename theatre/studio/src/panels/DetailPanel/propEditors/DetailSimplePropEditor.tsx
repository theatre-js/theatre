import type {IBasePropType} from '@theatre/core/propTypes'
import React from 'react'
import {useEditingToolsForPrimitivePropInDetailsPanel} from './utils/useEditingToolsForPrimitivePropInDetailsPanel'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import type {ISimplePropDetailEditorVFC} from './utils/IPropEditorFC'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'

type IDetailPropEditor<T extends IBasePropType<string, any>> =
  ISimplePropDetailEditorVFC<T>

// DetailView
// - Row
//   * Editor
// - Row
//   * Editor
const DetailSimplePropEditor: IDetailPropEditor<$IntentionalAny> = ({
  propConfig,
  pointerToProp,
  obj,
  SimpleEditorComponent: EditorComponent,
}) => {
  const stuff = useEditingToolsForPrimitivePropInDetailsPanel<$FixMe>(
    pointerToProp,
    obj,
    propConfig,
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <EditorComponent
        editingTools={stuff}
        propConfig={propConfig}
        value={stuff.value}
      />
    </SingleRowPropEditor>
  )
}

export default DetailSimplePropEditor
