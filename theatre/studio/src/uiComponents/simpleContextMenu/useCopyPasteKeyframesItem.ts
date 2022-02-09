import {useMemo} from 'react'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {DopeSheetSelection} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {getCopiedKeyframes, getTracks} from '@theatre/studio/selectors'
import type {IContextMenuItem} from './useContextMenu'

export const usePasteKeyframesItem = (
  leaf: SequenceEditorTree_PrimitiveProp,
): IContextMenuItem | null => {
  const copiedKeyframes = getCopiedKeyframes()

  return useMemo(() => {
    const totalKeyframes = Object.values(copiedKeyframes).reduce(
      (prev, curr) => {
        return prev + curr.length
      },
      0,
    )

    const {trackId, sheetObject} = leaf

    if (!trackId || !totalKeyframes) return null

    return {
      label: `Paste ${totalKeyframes} keyframe${totalKeyframes > 1 ? 's' : ''}`,
      callback: (e, position) => {
        getStudio().pasteKeyframes({
          trackId,
          sheetObject,
          keyframes: copiedKeyframes,
          position,
        })
      },
    }
  }, [leaf, copiedKeyframes])
}

export const useCopyKeyframesItem = ({
  leaf,
  selection,
  keyframe,
}: {
  leaf: SequenceEditorTree_PrimitiveProp
  selection?: DopeSheetSelection
  keyframe?: Keyframe
}): IContextMenuItem | null => {
  return useMemo(() => {
    const {sheetObject, trackId} = leaf
    const {address} = sheetObject

    if (!trackId) return null

    if (selection) {
      const {projectId, objectKey, sheetId} = address
      const {byTrackId} = selection.byObjectKey[objectKey]!

      const tracks = getTracks(projectId, sheetId)
      const {trackData = {}} = tracks?.[objectKey] || {}

      const selectedKeyframes = Object.keys(trackData).reduce((prev, key) => {
        const selectedKeyframeIds = Object.keys(
          byTrackId[key]?.byKeyframeId || {},
        )

        return {
          ...prev,
          [key]: trackData[key]!.keyframes.filter(
            ({id}) => selectedKeyframeIds.indexOf(id) > -1,
          ),
        }
      }, {})

      return {
        label: 'Copy selected keyframes',
        callback: () => {
          getStudio().transaction(({stateEditors}) => {
            stateEditors.studio.ahistoric.setKeyframesClipboard(
              selectedKeyframes,
            )
          })
        },
      }
    } else if (keyframe) {
      return {
        label: 'Copy keyframe',
        callback: () => {
          getStudio().transaction(({stateEditors}) => {
            stateEditors.studio.ahistoric.setKeyframesClipboard({
              [trackId]: [keyframe],
            })
          })
        },
      }
    }

    return null
  }, [leaf, selection, keyframe])
}