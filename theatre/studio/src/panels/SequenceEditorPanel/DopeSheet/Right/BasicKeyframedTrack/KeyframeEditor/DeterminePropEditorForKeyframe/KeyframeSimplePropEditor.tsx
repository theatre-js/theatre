import React from 'react'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import styled from 'styled-components'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {IEditingTools} from '@theatre/studio/propEditors/utils/IEditingTools'

export type IKeyframeSimplePropEditorProps<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
> = {
  propConfig: TPropTypeConfig
  editingTools: IEditingTools<TPropTypeConfig['valueType']>
  keyframeValue: TPropTypeConfig['valueType']
  SimpleEditorComponent: React.VFC<ISimplePropEditorReactProps<TPropTypeConfig>>
}

const KeyframeSimplePropEditorContainer = styled.div`
  padding: 0 6px;
  display: flex;
  align-items: center;
`

/**
 * Initially used for inline keyframe property editor, this editor is attached to the
 * functionality of editing a property for a sequence keyframe.
 */
function KeyframeSimplePropEditor<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
>({
  propConfig,
  editingTools,
  keyframeValue: value,
  SimpleEditorComponent: EditorComponent,
}: IKeyframeSimplePropEditorProps<TPropTypeConfig>) {
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
