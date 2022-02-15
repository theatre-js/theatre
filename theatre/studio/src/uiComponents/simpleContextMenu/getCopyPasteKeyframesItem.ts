import {val} from '@theatre/dataverse'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {DopeSheetSelection} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {getCopiedKeyframes} from '@theatre/studio/selectors'
import type {IContextMenuItem} from './useContextMenu'

export const getPasteKeyframesItem = (
  leaf: SequenceEditorTree_PrimitiveProp,
): IContextMenuItem | null => {
  const copiedKeyframes = getCopiedKeyframes()

  const totalKeyframes = copiedKeyframes.reduce((currentTotal, {keyframes}) => {
    return currentTotal + keyframes.length
  }, 0)

  const {trackId, sheetObject} = leaf

  const sequence = sheetObject.sheet.getSequence()
  const posInUnitSpace = sequence.positionDerivation.getValue()

  if (!trackId || !totalKeyframes) return null

  return {
    label: `Paste ${totalKeyframes} keyframe${totalKeyframes > 1 ? 's' : ''}`,
    callback: (e) => {
      getStudio().pasteKeyframes({
        trackId,
        sheetObject,
        keyframes: copiedKeyframes,
        position: posInUnitSpace,
      })
    },
  }
}

export const getCopyKeyframesItem = ({
  leaf,
  selection,
  keyframe,
}: {
  leaf: SequenceEditorTree_PrimitiveProp
  selection?: DopeSheetSelection
  keyframe?: Keyframe
}): IContextMenuItem | null => {
  const {sheetObject, trackId: selectedTrackId} = leaf
  const {address} = sheetObject

  if (!selectedTrackId) return null

  if (selection) {
    return {
      label: 'Copy selected keyframes',
      callback: () => {
        const {projectId, objectKey, sheetId} = address
        const {byTrackId} = selection.byObjectKey[objectKey]!

        const projectP = val(getStudio().projectsP[projectId].pointers)
        const {sequence} = val(projectP.historic).sheetsById[sheetId] || {}
        const tracks = sequence?.tracksByObject
        const {trackData = {}} = tracks?.[objectKey] || {}

        const allTracks = val(
          sheetObject.template.getArrayOfValidSequenceTracks(),
        )
        const selectedKeyframes = allTracks.map(({pathToProp, trackId}) => {
          const selectedKeyframeIds = Object.keys(
            byTrackId[trackId]?.byKeyframeId || {},
          )

          const keyframes = trackData[trackId]!.keyframes.filter(
            ({id}) => selectedKeyframeIds.indexOf(id) > -1,
          )

          return {
            pathToProp,
            trackId,
            keyframes,
          }
        })
        getStudio().transaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.setKeyframesClipboard(selectedKeyframes)
        })
      },
    }
  } else if (keyframe) {
    return {
      label: 'Copy keyframe',
      callback: () => {
        const allTracks = val(
          sheetObject.template.getArrayOfValidSequenceTracks(),
        )
        const selectedKeyframes = allTracks.map(({pathToProp, trackId}) => {
          return {
            pathToProp,
            trackId,
            keyframes: trackId === selectedTrackId ? [keyframe] : [],
          }
        })

        getStudio().transaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.setKeyframesClipboard(selectedKeyframes)
        })
      },
    }
  }

  return null
}
