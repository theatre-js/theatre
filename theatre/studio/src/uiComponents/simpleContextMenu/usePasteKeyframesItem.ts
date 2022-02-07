import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import {useFrameStampPositionD} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {getCopiedKeyframes} from '@theatre/studio/selectors'
import type {IContextMenuItem} from './useContextMenu'

type LeafType =
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_PropWithChildren
  | SequenceEditorTree_PrimitiveProp

const usePasteKeyframesItem = (leaf: LeafType): IContextMenuItem | null => {
  const [posInUnitSpace] = useVal(useFrameStampPositionD())

  const copiedKeyframes = getCopiedKeyframes()
  const {trackId, sheetObject} = leaf
  const totalKeyframes = Object.values(copiedKeyframes).reduce((prev, curr) => {
    return prev + curr.length
  }, 0)

  if (trackId && totalKeyframes) {
    return {
      label: `Paste ${totalKeyframes} keyframe(s)`,
      callback: () => {
        getStudio().pasteKeyframes({
          trackId,
          sheetObject,
          keyframes: copiedKeyframes,
          posInUnitSpace,
        })
      },
    }
  }

  return null
}

export default usePasteKeyframesItem
