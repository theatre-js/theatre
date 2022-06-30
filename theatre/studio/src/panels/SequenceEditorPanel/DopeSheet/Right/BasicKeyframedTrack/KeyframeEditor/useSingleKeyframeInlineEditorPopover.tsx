import React from 'react'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {DeterminePropEditorForKeyframeTree} from './DeterminePropEditorForSingleKeyframe'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {UnknownValidCompoundProps} from '@theatre/core/propTypes/internals'

/** The editor that pops up when directly clicking a Keyframe. */
export function useKeyframeInlineEditorPopover(
  props: EditingOptionsTree | null,
) {
  return usePopover({debugName: 'useKeyframeInlineEditorPopover'}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      {props === null ? undefined : (
        <DeterminePropEditorForKeyframeTree {...props} />
      )}
    </BasicPopover>
  ))
}

export type EditingOptionsTree =
  | SheetObjectEditingOptionsTree
  | PropWithChildrenEditingOptionsTree
  | PrimitivePropEditingOptions
type SheetObjectEditingOptionsTree = {
  type: 'sheetObject'
  sheetObject: SheetObject
  children: EditingOptionsTree[]
}
type PropWithChildrenEditingOptionsTree = {
  type: 'propWithChildren'
  propConfig: PropTypeConfig_Compound<UnknownValidCompoundProps>
  pathToProp: PathToProp
  children: EditingOptionsTree[]
}
export type PrimitivePropEditingOptions = {
  type: 'primitiveProp'
  keyframe: Keyframe
  propConfig: PropTypeConfig_AllSimples | PropTypeConfig_Enum // note: enums are not implemented yet
  sheetObject: SheetObject
  trackId: SequenceTrackId
  pathToProp: PathToProp
}
