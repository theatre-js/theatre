import type {IBasePropType} from '@theatre/core/propTypes'
import React from 'react'
import type {ISimplePropKeyframeEditorVFC} from './utils/IPropEditorFC'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import styled from 'styled-components'

type IKeyframePropEditor<T extends IBasePropType<string, any>> =
  ISimplePropKeyframeEditorVFC<T>

const KeyframeSimplePropEditorContainer = styled.div`
  padding: 0 6px;
  display: flex;
  align-items: center;
`

const KeyframeSimplePropEditor: IKeyframePropEditor<$IntentionalAny> = ({
  propConfig,
  editingTools,
  keyframeValue: value,
  SimpleEditorComponent: EditorComponent,
}) => {
  // question: do we need a container of some kind?
  return (
    <KeyframeSimplePropEditorContainer>
      <EditorComponent
        editingTools={editingTools}
        propConfig={propConfig}
        value={value}
      />
    </KeyframeSimplePropEditorContainer>
  )
}

export default KeyframeSimplePropEditor
