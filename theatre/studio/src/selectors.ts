import type Project from '@theatre/core/projects/Project'
import type Sequence from '@theatre/core/sequences/Sequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import {val} from '@theatre/dataverse'
import {isSheet, isSheetObject} from '@theatre/shared/instanceTypes'
import type {
  WithoutSheetInstance,
  SheetObjectAddress,
} from '@theatre/shared/utils/addresses'
import {uniq} from 'lodash-es'
import getStudio from './getStudio'
import type {
  CopiedTrack,
  OutlineSelectable,
  OutlineSelection,
} from './store/types'
import type {
  BasicKeyframedTrack,
  Keyframe,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {StrictRecord} from '@theatre/shared/utils/types'
import {generateKeyframeId} from '@theatre/shared/utils/ids'

export type Track = WithoutSheetInstance<SheetObjectAddress> & {
  trackId: string
  keyframes: Array<Keyframe>
  snappingFunction: (p: number) => number
}

export const getOutlineSelection = (): OutlineSelection => {
  const projects = val(getStudio().projectsP)

  const mapped: (OutlineSelectable | undefined)[] = (
    val(getStudio().atomP.historic.panels.outlinePanel.selection) ?? []
  ).map((s) => {
    const project = projects[s.projectId]
    if (!project) return
    if (s.type === 'Project') return project
    const sheetTemplate = val(project.sheetTemplatesP[s.sheetId])
    if (!sheetTemplate) {
      return
    }
    const sheetInstance = getSelectedInstanceOfSheetId(project, s.sheetId)
    if (!sheetInstance) return
    if (s.type === 'Sheet') {
      return sheetInstance
    }
    const obj = val(sheetInstance.objectsP[s.objectKey])
    if (!obj) return
    return obj
  })

  return uniq(
    mapped.filter((s): s is OutlineSelectable => typeof s !== 'undefined'),
  )
}

export const getSelectedInstanceOfSheetId = (
  project: Project,
  selectedSheetId: string,
): Sheet | undefined => {
  const projectStateP =
    getStudio()!.atomP.historic.projects.stateByProjectId[
      project.address.projectId
    ]

  const instanceId = val(
    projectStateP.stateBySheetId[selectedSheetId].selectedInstanceId,
  )

  const template = val(project.sheetTemplatesP[selectedSheetId])

  if (!template) return undefined

  if (instanceId) {
    return val(template.instancesP[instanceId])
  } else {
    // @todo #perf this will update every time an instance is added/removed.
    const allInstances = val(template.instancesP)

    return allInstances[Object.keys(allInstances)[0]]
  }
}

/**
 * component instances could come and go all the time. This hook
 * makes sure we don't cause re-renders
 */
export function getRegisteredSheetIds(project: Project): string[] {
  return Object.keys(val(project.sheetTemplatesP))
}

export function getSelectedSequence(): undefined | Sequence {
  const selectedSheets = uniq(
    getOutlineSelection()
      .filter((s): s is SheetObject | Sheet => isSheet(s) || isSheetObject(s))
      .map((s) => (isSheetObject(s) ? s.sheet : s)),
  )
  const sheet = selectedSheets[0]
  if (!sheet) return

  return sheet.getSequence()
}

export function getCopiedKeyframes(): CopiedTrack[] {
  return val(getStudio()!.atomP.ahistoric.keyframesClipboard) || []
}

export function getAllTrackData(
  project: Project,
  sheetObject: SheetObject,
): StrictRecord<string, BasicKeyframedTrack> {
  const {sheetId, objectKey} = sheetObject.address
  const instance = getSelectedInstanceOfSheetId(project, sheetId)!

  const tracks = val(instance.project.pointers.historic).sheetsById[sheetId]
    ?.sequence?.tracksByObject[objectKey]!

  return tracks.trackData
}

export function getMergedTracks(
  project: Project,
  sheetObject: SheetObject,
  tracks: Track[],
): Track[] {
  const allTrackData = getAllTrackData(project, sheetObject)
  const mergeTracks = tracks.map(({trackId, keyframes, ...rest}) => {
    const currentKeyframes = allTrackData![trackId]!.keyframes
    const keyframesWithNewIds = keyframes.map((kf) => ({
      ...kf,
      id: generateKeyframeId(),
    }))
    return {
      ...rest,
      trackId,
      keyframes: [...currentKeyframes, ...keyframesWithNewIds],
    }
  })

  return mergeTracks
}
