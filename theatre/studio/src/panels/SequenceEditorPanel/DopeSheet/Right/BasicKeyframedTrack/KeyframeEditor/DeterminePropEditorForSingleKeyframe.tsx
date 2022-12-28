import React from 'react'
import styled from 'styled-components'

import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {ISimplePropEditorReactProps} from '@theatre/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import {simplePropEditorByPropType} from '@theatre/studio/propEditors/simpleEditors/simplePropEditorByPropType'
import type {
  EditingOptionsTree,
  PrimitivePropEditingOptions,
} from './useSingleKeyframeInlineEditorPopover'
import last from 'lodash-es/last'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {valueInProp} from '@theatre/shared/propTypes/utils'

const SingleKeyframePropEditorContainer = styled.div`
  display: flex;
  align-items: stretch;
  min-width: 200px;

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
  padding: 6px 6px 6px 0;

  width: 40%;

  color: #919191;

  overflow: hidden;
`

const INDENT_PX = 10

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
export function DeterminePropEditorForKeyframeTree(
  p: EditingOptionsTree & {autoFocusInput?: boolean; indent: number},
) {
  if (p.type === 'sheetObject') {
    return (
      <>
        <SingleKeyframePropLabel
          style={{paddingLeft: `${p.indent * INDENT_PX}px`}}
        >
          {p.sheetObject.address.objectKey}
        </SingleKeyframePropLabel>
        {p.children.map((c, i) => (
          <DeterminePropEditorForKeyframeTree
            key={i}
            {...c}
            autoFocusInput={p.autoFocusInput && i === 0}
            indent={p.indent + 1}
          />
        ))}
      </>
    )
  } else if (p.type === 'propWithChildren') {
    const label = p.propConfig.label ?? last(p.pathToProp)
    return (
      <>
        <SingleKeyframePropLabel
          style={{paddingLeft: `${p.indent * INDENT_PX}px`}}
        >
          {label}
        </SingleKeyframePropLabel>
        {p.children.map((c, i) => (
          <DeterminePropEditorForKeyframeTree
            key={i}
            {...c}
            autoFocusInput={p.autoFocusInput && i === 0}
            indent={p.indent + 1}
          />
        ))}
      </>
    )
  } else {
    return (
      <PrimitivePropEditor
        {...p}
        autoFocusInput={p.autoFocusInput}
        indent={p.indent}
      />
    )
  }
}

const SingleKeyframeSimplePropEditorContainer = styled.div`
  display: flex;
  align-items: center;
  width: 60%;
`

function PrimitivePropEditor(
  p: PrimitivePropEditingOptions & {autoFocusInput?: boolean; indent: number},
) {
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
        <SingleKeyframePropLabel>
          <span style={{paddingLeft: `${p.indent * INDENT_PX}px`}}>
            {label}
          </span>
        </SingleKeyframePropLabel>
        <SingleKeyframeSimplePropEditorContainer>
          <PropEditor
            editingTools={editingTools}
            propConfig={p.propConfig}
            value={valueInProp(p.keyframe.value, p.propConfig)}
            autoFocus={p.autoFocusInput}
          />
        </SingleKeyframeSimplePropEditorContainer>
      </SingleKeyframePropEditorContainer>
    )
  }
}

// These editing tools are distinct from the editing tools used in the
// prop editors in the details panel: These editing tools edit the value of a keyframe
// while the details editing tools edit the value of the sequence at the playhead
// (potentially creating a new keyframe).
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
  }, obj)
}
