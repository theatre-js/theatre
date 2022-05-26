import React from 'react'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import styled from 'styled-components'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {IEditingTools} from '@theatre/studio/propEditors/utils/IEditingTools'

export type ISingleKeyframeSimplePropEditorProps<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
> = {
  propConfig: TPropTypeConfig
  editingTools: IEditingTools<TPropTypeConfig['valueType']>
  keyframeValue: TPropTypeConfig['valueType']
  SimpleEditorComponent: React.VFC<ISimplePropEditorReactProps<TPropTypeConfig>>
}

const SingleKeyframeSimplePropEditorContainer = styled.div`
  padding: 0 6px;
  display: flex;
  align-items: center;
`

/**
 * Initially used for inline keyframe property editor, this editor is attached to the
 * functionality of editing a property for a sequence keyframe.
 */
function SingleKeyframeSimplePropEditor<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
>({
  propConfig,
  editingTools,
  keyframeValue: value,
  SimpleEditorComponent: EditorComponent,
}: ISingleKeyframeSimplePropEditorProps<TPropTypeConfig>) {
  return (
    <SingleKeyframeSimplePropEditorContainer>
      <EditorComponent
        editingTools={editingTools}
        propConfig={propConfig}
        value={value}
      />
    </SingleKeyframeSimplePropEditorContainer>
  )
}

export default SingleKeyframeSimplePropEditor
