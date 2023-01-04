import type {Prism} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import type {
  KeyframeId,
  ObjectAddressKey,
  ProjectId,
  SequenceTrackId,
  SheetId,
} from '@theatre/shared/utils/ids'
import getStudio from '@theatre/studio/getStudio'
import type {DopeSheetSelection} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {
  commonRootOfPathsToProps,
  decodePathToProp,
} from '@theatre/shared/utils/addresses'
import type {StrictRecord} from '@theatre/shared/utils/types'
import type {KeyframeWithPathToPropFromCommonRoot} from '@theatre/studio/store/types'

/**
 * Keyframe connections are considered to be selected if the first
 * keyframe in the connection is selected
 */
export function isKeyframeConnectionInSelection(
  keyframeConnection: {left: Keyframe; right: Keyframe},
  selection: DopeSheetSelection,
): boolean {
  for (const {keyframeId} of flatSelectionKeyframeIds(selection)) {
    if (keyframeConnection.left.id === keyframeId) return true
  }
  return false
}

export type KeyframeConnectionWithAddress = {
  projectId: ProjectId
  sheetId: SheetId
  objectKey: ObjectAddressKey
  trackId: SequenceTrackId
  left: Keyframe
  right: Keyframe
}

/**
 * Returns an array of all the selected keyframes
 * that are connected to one another. Useful for changing
 * the tweening in between keyframes.
 *
 * TODO - rename to selectedKeyframeConnectionsD(), or better yet,
 * make it a `prism.ensurePrism()` function, rather than returning
 * a prism.
 */
export function selectedKeyframeConnections(
  projectId: ProjectId,
  sheetId: SheetId,
  selection: DopeSheetSelection | undefined,
): Prism<Array<KeyframeConnectionWithAddress>> {
  return prism(() => {
    if (selection === undefined) return []

    let ckfs: Array<KeyframeConnectionWithAddress> = []

    for (const {objectKey, trackId} of flatSelectionTrackIds(selection)) {
      const track = val(
        getStudio().atomP.historic.coreByProject[projectId].sheetsById[sheetId]
          .sequence.tracksByObject[objectKey].trackData[trackId],
      )

      if (track) {
        ckfs = ckfs.concat(
          keyframeConnections(track.keyframes)
            .filter((kfc) => isKeyframeConnectionInSelection(kfc, selection))
            .map(({left, right}) => ({
              left,
              right,
              trackId,
              objectKey,
              sheetId,
              projectId,
            })),
        )
      }
    }
    return ckfs
  })
}

/**
 * Given a selection, returns a list of keyframes and paths
 * that are relative to a common root path. For example, if
 * the selection contains a keyframe on both the following tracks:
 * - exObject.transform.position.x
 * - exObject.transform.position.y
 * then the result will be
 * ```
 * [{ keyframe, pathToProp: ['x']}, { keyframe, pathToProp: ['y']}]
 * ```
 *
 * If the selection contains a keyframe on
 * all the following tracks:
 * - exObject.transform.position.x
 * - exObject.transform.position.y
 * - exObject.transform.scale.x
 * then the result will be
 * ```
 * [
 *   {keyframe, pathToProp: ['position', 'x']},
 *   {keyframe, pathToProp: ['position', 'y']},
 *   {keyframe, pathToProp: ['scale',    'x']},
 * ]
 * ```
 */
export function copyableKeyframesFromSelection(
  projectId: ProjectId,
  sheetId: SheetId,
  selection: DopeSheetSelection | undefined,
): KeyframeWithPathToPropFromCommonRoot[] {
  if (selection === undefined) return []

  let kfs: KeyframeWithPathToPropFromCommonRoot[] = []

  for (const {objectKey, trackId, keyframeIds} of flatSelectionTrackIds(
    selection,
  )) {
    kfs = kfs.concat(
      keyframesWithPaths({
        projectId,
        sheetId,
        objectKey,
        trackId,
        keyframeIds,
      }) ?? [],
    )
  }

  const commonPath = commonRootOfPathsToProps(kfs.map((kf) => kf.pathToProp))

  const keyframesWithCommonRootPath = kfs.map(({keyframe, pathToProp}) => ({
    keyframe,
    pathToProp: pathToProp.slice(commonPath.length),
  }))

  return keyframesWithCommonRootPath
}

/**
 * @see copyableKeyframesFromSelection
 */
export function keyframesWithPaths({
  projectId,
  sheetId,
  objectKey,
  trackId,
  keyframeIds,
}: {
  projectId: ProjectId
  sheetId: SheetId
  objectKey: ObjectAddressKey
  trackId: SequenceTrackId
  keyframeIds: KeyframeId[]
}): KeyframeWithPathToPropFromCommonRoot[] | null {
  const tracksByObject = val(
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[sheetId]
      .sequence.tracksByObject[objectKey],
  )
  const track = tracksByObject?.trackData[trackId]

  if (!track) return null

  const propPathByTrackId = swapKeyAndValue(
    tracksByObject?.trackIdByPropPath || {},
  )
  const encodedPropPath = propPathByTrackId[trackId]

  if (!encodedPropPath) return null
  const pathToProp = [objectKey, ...decodePathToProp(encodedPropPath)]

  return keyframeIds
    .map((keyframeId) => ({
      keyframe: track.keyframes.find((keyframe) => keyframe.id === keyframeId),
      pathToProp,
    }))
    .filter(
      ({keyframe}) => keyframe !== undefined,
    ) as KeyframeWithPathToPropFromCommonRoot[]
}

function swapKeyAndValue<K extends string, V extends string>(
  obj: StrictRecord<K, V>,
): StrictRecord<V, K> {
  const result: StrictRecord<V, K> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[value as V] = key
  }
  return result
}

export function keyframeConnections(
  keyframes: Array<Keyframe>,
): Array<{left: Keyframe; right: Keyframe}> {
  return keyframes
    .map((kf, i) => ({left: kf, right: keyframes[i + 1]}))
    .slice(0, -1) // remmove the last entry because it is { left: kf, right: undefined }
}

export function flatSelectionKeyframeIds(selection: DopeSheetSelection): Array<{
  objectKey: ObjectAddressKey
  trackId: SequenceTrackId
  keyframeId: KeyframeId
}> {
  const result = []
  for (const [objectKey, maybeObjectRecord] of Object.entries(
    selection?.byObjectKey ?? {},
  )) {
    for (const [trackId, maybeTrackRecord] of Object.entries(
      maybeObjectRecord?.byTrackId ?? {},
    )) {
      for (const keyframeId of Object.keys(
        maybeTrackRecord?.byKeyframeId ?? {},
      )) {
        result.push({objectKey, trackId, keyframeId})
      }
    }
  }
  return result
}

export function flatSelectionTrackIds(selection: DopeSheetSelection): Array<{
  objectKey: ObjectAddressKey
  trackId: SequenceTrackId
  keyframeIds: Array<KeyframeId>
}> {
  const result = []
  for (const [objectKey, maybeObjectRecord] of Object.entries(
    selection?.byObjectKey ?? {},
  )) {
    for (const [trackId, maybeTrackRecord] of Object.entries(
      maybeObjectRecord?.byTrackId ?? {},
    )) {
      result.push({
        objectKey,
        trackId,
        keyframeIds: Object.keys(maybeTrackRecord?.byKeyframeId ?? {}),
      })
    }
  }
  return result
}
