import React from 'react'
import last from 'lodash-es/last'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {DeterminePropEditorForSingleKeyframe} from './DeterminePropEditorForSingleKeyframe'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PropTypeConfig} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/utils/addresses'

/** The editor that pops up when directly clicking a Keyframe. */
export function useSingleKeyframeInlineEditorPopover(
  props: SingleKeyframeEditingOptions,
) {
  const editingTools = useEditingToolsForKeyframeEditorPopover(props)
  const label = props.propConf.label ?? last(props.pathToProp)

  return usePopover({debugName: 'useKeyframeInlineEditorPopover'}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      <DeterminePropEditorForSingleKeyframe
        propConfig={props.propConf}
        editingTools={editingTools}
        keyframeValue={props.keyframe.value}
        displayLabel={label != null ? String(label) : undefined}
      />
    </BasicPopover>
  ))
}

type SingleKeyframeEditingOptions = {
  keyframe: Keyframe
  propConf: PropTypeConfig
  sheetObject: SheetObject
  trackId: SequenceTrackId
  pathToProp: PathToProp
}

function useEditingToolsForKeyframeEditorPopover(
  props: SingleKeyframeEditingOptions,
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
