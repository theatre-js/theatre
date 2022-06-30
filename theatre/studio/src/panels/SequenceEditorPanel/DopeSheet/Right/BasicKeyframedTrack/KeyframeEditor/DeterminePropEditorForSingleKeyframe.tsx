import React from 'react'
import styled from 'styled-components'

import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import {simplePropEditorByPropType} from '@theatre/studio/propEditors/simpleEditors/simplePropEditorByPropType'

import SingleKeyframeSimplePropEditor from './DeterminePropEditorForSingleKeyframe/SingleKeyframeSimplePropEditor'
import type {
  EditingOptionsTree,
  PrimitivePropEditingOptions,
} from './useSingleKeyframeInlineEditorPopover'
import last from 'lodash-es/last'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'

const SingleKeyframePropEditorContainer = styled.div`
  display: flex;
  align-items: stretch;

  select {
    min-width: 100px;
  }
`
const SingleKeyframePropLabel = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.01em;
  margin-right: 12px;
  padding: 8px;

  color: #919191;
`

const IndentedThing = styled.div`
  margin-left: 24px;
`

/**
 * Given a propConfig, this function gives the corresponding prop editor for
 * use in the dope sheet inline prop editor on a keyframe.
 * {@link DeterminePropEditorForDetail} does the same thing for the details panel. The main difference
 * between this function and {@link DeterminePropEditorForDetail} is that this
 * one shows prop editors *without* keyframe navigation controls (that look
 * like `< ・ >`).
 *
 * @param p - propConfig object for any type of prop.
 */
export function DeterminePropEditorForKeyframeTree(p: EditingOptionsTree) {
  if (p.type === 'sheetObject') {
    return (
      <>
        <SingleKeyframePropLabel>
          {p.sheetObject.address.objectKey}
        </SingleKeyframePropLabel>
        <IndentedThing>
          {p.children.map((c, i) => (
            <DeterminePropEditorForKeyframeTree key={i} {...c} />
          ))}
        </IndentedThing>
      </>
    )
  } else if (p.type === 'propWithChildren') {
    const label = p.propConfig.label ?? last(p.pathToProp)
    return (
      <>
        <SingleKeyframePropLabel>{label}</SingleKeyframePropLabel>
        <IndentedThing>
          {p.children.map((c, i) => (
            <DeterminePropEditorForKeyframeTree key={i} {...c} />
          ))}
        </IndentedThing>
      </>
    )
  } else {
    return <BeepBoop {...p} />
  }
}

function BeepBoop(p: PrimitivePropEditingOptions) {
  const label = p.propConfig.label ?? last(p.pathToProp)
  const editingTools = useEditingToolsForKeyframeEditorPopover(p)

  if (p.propConfig.type === 'enum') {
    // notice: enums are not implemented, yet.
    return <></>
  } else {
    const PropEditor = simplePropEditorByPropType[
      p.propConfig.type
    ] as React.VFC<ISimplePropEditorReactProps<PropTypeConfig_AllSimples>>
    return (
      <SingleKeyframePropEditorContainer>
        <SingleKeyframePropLabel>{label}</SingleKeyframePropLabel>
        <SingleKeyframeSimplePropEditor
          SimpleEditorComponent={PropEditor}
          propConfig={p.propConfig}
          editingTools={editingTools}
          keyframeValue={p.keyframe.value}
        />
      </SingleKeyframePropEditorContainer>
    )
  }
}

function useEditingToolsForKeyframeEditorPopover(
  props: PrimitivePropEditingOptions,
) {
  const obj = props.sheetObject
  return useTempTransactionEditingTools(({stateEditors}, value) => {
    const newKeyframe = {...props.keyframe, value}
    stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes({
      ...obj.address,
      trackId: props.trackId,
      keyframes: [newKeyframe],
      snappingFunction: obj.sheet.getSequence().closestGridPosition,
    })
  })
}
