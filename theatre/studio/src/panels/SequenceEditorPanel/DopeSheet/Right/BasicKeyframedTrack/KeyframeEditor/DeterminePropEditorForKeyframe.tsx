import React from 'react'
import styled from 'styled-components'

import type {
  PropTypeConfig,
  PropTypeConfig_AllSimples,
} from '@theatre/core/propTypes'
import type {IEditingTools} from '@theatre/studio/propEditors/utils/IEditingTools'
import type {PropConfigForType} from '@theatre/studio/propEditors/utils/PropConfigForType'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import {simplePropEditorByPropType} from '@theatre/studio/propEditors/simpleEditors/simplePropEditorByPropType'

import KeyframeSimplePropEditor from './DeterminePropEditorForKeyframe/KeyframeSimplePropEditor'

type IDeterminePropEditorForKeyframeProps<K extends PropTypeConfig['type']> = {
  editingTools: IEditingTools<PropConfigForType<K>['valueType']>
  propConfig: PropConfigForType<K>
  keyframeValue: PropConfigForType<K>['valueType']
  displayLabel?: string
}

const KeyframePropEditorContainer = styled.div`
  padding: 2px;
  display: flex;
  align-items: stretch;

  select {
    min-width: 100px;
  }
`
const KeyframePropLabel = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.01em;
  margin-right: 12px;
  padding: 8px;

  color: #919191;
`

/**
 * Given a propConfig, this function gives the corresponding prop editor for
 * use in the dope sheet inline prop editor on a keyframe.
 * {@link DetailDeterminePropEditor} does the same thing for the details panel. The main difference
 * between this function and {@link DetailDeterminePropEditor} is that this
 * one shows prop editors *without* keyframe navigation controls (that look
 * like `< ・ >`).
 *
 * @param p - propConfig object for any type of prop.
 */
export function DeterminePropEditorForKeyframe(
  p: IDeterminePropEditorForKeyframeProps<PropTypeConfig['type']>,
) {
  const propConfig = p.propConfig

  if (propConfig.type === 'compound') {
    throw new Error(
      'We do not yet support editing compound props for a keyframe',
    )
  } else if (propConfig.type === 'enum') {
    // notice: enums are not implemented, yet.
    return <></>
  } else {
    const PropEditor = simplePropEditorByPropType[propConfig.type]

    return (
      <KeyframePropEditorContainer>
        <KeyframePropLabel>{p.displayLabel}</KeyframePropLabel>
        <KeyframeSimplePropEditor
          SimpleEditorComponent={
            PropEditor as React.VFC<
              ISimplePropEditorReactProps<PropTypeConfig_AllSimples>
            >
          }
          propConfig={propConfig}
          editingTools={p.editingTools}
          keyframeValue={p.keyframeValue}
        />
      </KeyframePropEditorContainer>
    )
  }
}
