import React from 'react'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import styled from 'styled-components'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {IEditingTools} from '@theatre/studio/propEditors/utils/IEditingTools'
import type {IDerivation} from '@theatre/dataverse'

export type ISingleKeyframeSimplePropEditorProps<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
> = {
  propConfig: TPropTypeConfig
  editingToolsD: IDerivation<IEditingTools<TPropTypeConfig['valueType']>>
  keyframeValueD: IDerivation<TPropTypeConfig['valueType']>
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
  editingToolsD,
  keyframeValueD: valueD,
  SimpleEditorComponent: EditorComponent,
}: ISingleKeyframeSimplePropEditorProps<TPropTypeConfig>) {
  return (
    <SingleKeyframeSimplePropEditorContainer>
      <EditorComponent
        editingToolsD={editingToolsD}
        propConfig={propConfig}
        valueD={valueD}
      />
    </SingleKeyframeSimplePropEditorContainer>
  )
}

export default SingleKeyframeSimplePropEditor
