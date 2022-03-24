import type {DopeSheetSelection} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'

/**
 * @param selection - selection on the dope sheet, or undefined if there isn't a selection
 * @returns If the selection exists and contains one or more keyframes only in a single track,
 * then a list of those keyframe's ids; otherwise null
 */
export default function selectedKeyframeIdsIfInSingleTrack(
  selection: DopeSheetSelection | undefined,
): string[] | null {
  if (!selection) return null
  const objectKeys = Object.keys(selection.byObjectKey)
  if (objectKeys.length !== 1) return null
  const object = selection.byObjectKey[objectKeys[0]]
  if (!object) return null
  const trackIds = Object.keys(object.byTrackId)
  const firstTrack = object.byTrackId[trackIds[0]]
  if (trackIds.length !== 1 && firstTrack) return null

  return Object.keys(firstTrack!.byKeyframeId)
}
