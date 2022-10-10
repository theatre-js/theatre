import type Project from '@theatre/core/projects/Project'
import type Sequence from '@theatre/core/sequences/Sequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import {val} from '@theatre/dataverse'
import type {$IntentionalAny} from '@theatre/dataverse/src/types'
import {isSheet, isSheetObject} from '@theatre/shared/instanceTypes'
import type {SheetId} from '@theatre/shared/utils/ids'
import {uniq} from 'lodash-es'
import getStudio from './getStudio'
import type {OutlineSelectable, OutlineSelection} from './store/types'

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
    projectStateP.stateBySheetId[selectedSheetId as SheetId].selectedInstanceId,
  )

  const template = val(project.sheetTemplatesP[selectedSheetId])

  if (!template) return undefined

  if (instanceId) {
    return val(template.instancesP[instanceId])
  } else {
    // @todo #perf this will update every time an instance is added/removed.
    const allInstances = val(template.instancesP)

    return allInstances[keys(allInstances)[0]]
  }
}

function keys<T extends object>(obj: T): Exclude<keyof T, symbol | number>[] {
  return Object.keys(obj) as $IntentionalAny
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
