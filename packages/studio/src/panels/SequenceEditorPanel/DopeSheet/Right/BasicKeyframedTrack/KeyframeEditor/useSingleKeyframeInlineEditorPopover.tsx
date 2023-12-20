import React from 'react'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {DeterminePropEditorForKeyframeTree} from './DeterminePropEditorForSingleKeyframe'
import type {SequenceTrackId} from '@theatre/core/types/public'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
  UnknownValidCompoundProps,
  BasicKeyframe,
} from '@theatre/core/types/public'
import type {PathToProp} from '@theatre/utils/pathToProp'

/** The editor that pops up when directly clicking a Keyframe. */
export function useKeyframeInlineEditorPopover(
  props: EditingOptionsTree[] | null,
) {
  return usePopover({debugName: 'useKeyframeInlineEditorPopover'}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      {!Array.isArray(props)
        ? undefined
        : props.map((prop, i) => (
            <DeterminePropEditorForKeyframeTree
              key={i}
              {...prop}
              autoFocusInput={i === 0}
              indent={0}
            />
          ))}
    </BasicPopover>
  ))
}

export type EditingOptionsTree =
  | SheetObjectEditingOptionsTree
  | PropWithChildrenEditingOptionsTree
  | PrimitivePropEditingOptions
export type SheetObjectEditingOptionsTree = {
  type: 'sheetObject'
  sheetObject: SheetObject
  children: EditingOptionsTree[]
}
export type PropWithChildrenEditingOptionsTree = {
  type: 'propWithChildren'
  propConfig: PropTypeConfig_Compound<UnknownValidCompoundProps>
  pathToProp: PathToProp
  children: EditingOptionsTree[]
}
export type PrimitivePropEditingOptions = {
  type: 'primitiveProp'
  keyframe: BasicKeyframe
  propConfig: PropTypeConfig_AllSimples | PropTypeConfig_Enum // note: enums are not implemented yet
  sheetObject: SheetObject
  trackId: SequenceTrackId
  pathToProp: PathToProp
}
