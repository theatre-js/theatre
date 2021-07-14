import type {
  Keyframe,
  SheetState_Historic,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {Drafts} from '@theatre/studio/StudioStore/StudioStore'
import type {
  ProjectAddress,
  PropAddress,
  SheetAddress,
  SheetObjectAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import type {KeyframeId} from '@theatre/shared/utils/ids'
import {
  generateKeyframeId,
  generateSequenceTrackId,
} from '@theatre/shared/utils/ids'
import removePathFromObject from '@theatre/shared/utils/removePathFromObject'
import {transformNumber} from '@theatre/shared/utils/transformNumber'
import type {IRange, SerializablePrimitive} from '@theatre/shared/utils/types'
import {current} from 'immer'
import findLastIndex from 'lodash-es/findLastIndex'
import keyBy from 'lodash-es/keyBy'
import pullFromArray from 'lodash-es/pull'
import set from 'lodash-es/set'
import sortBy from 'lodash-es/sortBy'
import {graphEditorColors} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import type {
  OutlineSelectable,
  OutlineSelectionState,
  PanelPosition,
} from './types'
import {uniq} from 'lodash-es'
import {
  isProject,
  isSheet,
  isSheetObject,
  isSheetObjectTemplate,
  isSheetTemplate,
} from '@theatre/shared/instanceTypes'
import type SheetTemplate from '@theatre/core/sheets/SheetTemplate'
import type SheetObjectTemplate from '@theatre/core/sheetObjects/SheetObjectTemplate'

export const setDrafts__onlyMeantToBeCalledByTransaction = (
  drafts: undefined | Drafts,
): typeof stateEditors => {
  currentDrafts = drafts
  return stateEditors
}

let currentDrafts: undefined | Drafts

const drafts = (): Drafts => {
  if (typeof currentDrafts === 'undefined') {
    throw new Error(
      `Calling stateEditors outside of a transaction is not allowed.`,
    )
  }

  return currentDrafts
}

namespace stateEditors {
  export namespace studio {
    export namespace historic {
      export namespace panelPositions {
        export function setPanelPosition(p: {
          panelId: string
          position: PanelPosition
        }) {
          const h = drafts().historic
          h.panelPositions ??= {}
          h.panelPositions[p.panelId] = p.position
        }
      }
      export namespace panels {
        export function _ensure() {
          drafts().historic.panels ??= {}
          return drafts().historic.panels!
        }

        export namespace outline {
          export function _ensure() {
            const panels = stateEditors.studio.historic.panels._ensure()
            panels.outlinePanel ??= {}
            return panels.outlinePanel!
          }
          export namespace selection {
            export function set(
              selection: (
                | OutlineSelectable
                | SheetTemplate
                | SheetObjectTemplate
              )[],
            ) {
              const newSelectionState: OutlineSelectionState[] = []

              for (const item of uniq(selection)) {
                if (isProject(item)) {
                  newSelectionState.push({type: 'Project', ...item.address})
                } else if (isSheet(item)) {
                  newSelectionState.push({
                    type: 'Sheet',
                    ...item.template.address,
                  })
                  stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.setSelectedInstanceId(
                    item.address,
                  )
                } else if (isSheetTemplate(item)) {
                  newSelectionState.push({type: 'Sheet', ...item.address})
                } else if (isSheetObject(item)) {
                  newSelectionState.push({
                    type: 'SheetObject',
                    ...item.template.address,
                  })
                  stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.setSelectedInstanceId(
                    item.sheet.address,
                  )
                } else if (isSheetObjectTemplate(item)) {
                  newSelectionState.push({type: 'SheetObject', ...item.address})
                }
              }
              outline._ensure().selection = newSelectionState
            }

            export function unset() {
              outline._ensure().selection = []
            }
          }
        }

        export namespace sequenceEditor {
          export function _ensure() {
            const panels = stateEditors.studio.historic.panels._ensure()
            panels.sequenceEditor ??= {}
            return panels.sequenceEditor!
          }
          export namespace graphEditor {
            function _ensure() {
              const s = sequenceEditor._ensure()
              s.graphEditor ??= {height: 0.5, isOpen: false}
              return s.graphEditor!
            }
            export function setIsOpen(p: {isOpen: boolean}) {
              _ensure().isOpen = p.isOpen
            }
          }
        }
      }
      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(p: ProjectAddress) {
            const s = drafts().historic
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace stateBySheetId {
            export function _ensure(p: WithoutSheetInstance<SheetAddress>) {
              const projectState =
                stateEditors.studio.historic.projects.stateByProjectId._ensure(
                  p,
                )
              if (!projectState.stateBySheetId[p.sheetId]) {
                projectState.stateBySheetId[p.sheetId] = {
                  selectedInstanceId: undefined,
                  sequenceEditor: {
                    selectedPropsByObject: {},
                  },
                }
              }

              return projectState.stateBySheetId[p.sheetId]!
            }

            export function setSelectedInstanceId(p: SheetAddress) {
              stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId._ensure(
                p,
              ).selectedInstanceId = p.sheetInstanceId
            }

            export namespace sequenceEditor {
              export function addPropToGraphEditor(
                p: WithoutSheetInstance<PropAddress>,
              ) {
                const {selectedPropsByObject} =
                  stateBySheetId._ensure(p).sequenceEditor
                if (!selectedPropsByObject[p.objectKey]) {
                  selectedPropsByObject[p.objectKey] = {}
                }
                const selectedProps = selectedPropsByObject[p.objectKey]!

                const path = encodePathToProp(p.pathToProp)

                const possibleColors = new Set<string>(
                  Object.keys(graphEditorColors),
                )
                for (const [_, selectedProps] of Object.entries(
                  current(selectedPropsByObject),
                )) {
                  // debugger
                  for (const [_, takenColor] of Object.entries(
                    selectedProps!,
                  )) {
                    possibleColors.delete(takenColor!)
                  }
                }

                const color =
                  possibleColors.size > 0
                    ? possibleColors.values().next().value
                    : Object.keys(graphEditorColors)[0]

                selectedProps[path] = color
              }

              export function removePropFromGraphEditor(
                p: WithoutSheetInstance<PropAddress>,
              ) {
                const {selectedPropsByObject} =
                  stateBySheetId._ensure(p).sequenceEditor
                if (!selectedPropsByObject[p.objectKey]) {
                  return
                }
                const selectedProps = selectedPropsByObject[p.objectKey]!

                const path = encodePathToProp(p.pathToProp)

                if (selectedProps[path]) {
                  removePathFromObject(selectedPropsByObject, [
                    p.objectKey,
                    path,
                  ])
                }
              }
            }
          }
        }
      }
    }
    export namespace ephemeral {
      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(p: ProjectAddress) {
            const s = drafts().ephemeral
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace stateBySheetId {
            export function _ensure(p: WithoutSheetInstance<SheetAddress>) {
              const projectState =
                stateEditors.studio.ephemeral.projects.stateByProjectId._ensure(
                  p,
                )
              if (!projectState.stateBySheetId[p.sheetId]) {
                projectState.stateBySheetId[p.sheetId] = {
                  stateByObjectKey: {},
                }
              }

              return projectState.stateBySheetId[p.sheetId]!
            }

            export namespace stateByObjectKey {
              export function _ensure(
                p: WithoutSheetInstance<SheetObjectAddress>,
              ) {
                const s =
                  stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId._ensure(
                    p,
                  ).stateByObjectKey
                s[p.objectKey] ??= {}
                return s[p.objectKey]!
              }
              export namespace propsBeingScrubbed {
                export function _ensure(
                  p: WithoutSheetInstance<SheetObjectAddress>,
                ) {
                  const s =
                    stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId.stateByObjectKey._ensure(
                      p,
                    )

                  s.valuesBeingScrubbed ??= {}
                  return s.valuesBeingScrubbed!
                }
                export function flag(p: WithoutSheetInstance<PropAddress>) {
                  set(_ensure(p), p.pathToProp, true)
                }
              }
            }
          }
        }
      }
    }
    export namespace ahistoric {
      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(p: ProjectAddress) {
            const s = drafts().ahistoric
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace stateBySheetId {
            export function _ensure(p: WithoutSheetInstance<SheetAddress>) {
              const projectState =
                stateEditors.studio.ahistoric.projects.stateByProjectId._ensure(
                  p,
                )
              if (!projectState.stateBySheetId[p.sheetId]) {
                projectState.stateBySheetId[p.sheetId] = {}
              }

              return projectState.stateBySheetId[p.sheetId]!
            }

            export namespace sequence {
              export function _ensure(p: WithoutSheetInstance<SheetAddress>) {
                const sheetState =
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId._ensure(
                    p,
                  )
                if (!sheetState.sequence) {
                  sheetState.sequence = {}
                }
                return sheetState.sequence!
              }

              export namespace clippedSpaceRange {
                export function set(
                  p: WithoutSheetInstance<SheetAddress> & {
                    range: IRange
                  },
                ) {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence._ensure(
                    p,
                  ).clippedSpaceRange = {...p.range}
                }
              }
            }
          }
        }
      }
    }
  }
  export namespace coreByProject {
    export namespace historic {
      export namespace sheetsById {
        export function _ensure(
          p: WithoutSheetInstance<SheetAddress>,
        ): SheetState_Historic {
          const sheetsById =
            drafts().historic.coreByProject[p.projectId].sheetsById

          if (!sheetsById[p.sheetId]) {
            sheetsById[p.sheetId] = {staticOverrides: {byObject: {}}}
          }
          return sheetsById[p.sheetId]!
        }

        export namespace sequence {
          export function _ensure(p: WithoutSheetInstance<SheetAddress>) {
            const s = stateEditors.coreByProject.historic.sheetsById._ensure(p)
            s.sequence ??= {
              subUnitsPerUnit: 30,
              length: 10,
              type: 'PositionalSequence',
              tracksByObject: {},
            }

            return s.sequence!
          }

          export function setLength(
            p: WithoutSheetInstance<SheetAddress> & {length: number},
          ) {
            _ensure(p).length = p.length
          }

          function _ensureTracksOfObject(
            p: WithoutSheetInstance<SheetObjectAddress>,
          ) {
            const s =
              stateEditors.coreByProject.historic.sheetsById.sequence._ensure(
                p,
              ).tracksByObject

            s[p.objectKey] ??= {trackData: {}, trackIdByPropPath: {}}

            return s[p.objectKey]!
          }

          export function setPrimitivePropAsSequenced(
            p: WithoutSheetInstance<PropAddress>,
          ) {
            const tracks = _ensureTracksOfObject(p)
            const pathEncoded = encodePathToProp(p.pathToProp)
            const possibleTrackId = tracks.trackIdByPropPath[pathEncoded]
            if (typeof possibleTrackId === 'string') return

            const trackId = generateSequenceTrackId()
            tracks.trackData[trackId] = {
              type: 'BasicKeyframedTrack',
              keyframes: [],
            }
            tracks.trackIdByPropPath[pathEncoded] = trackId
          }

          export function setPrimitivePropAsStatic(
            p: WithoutSheetInstance<PropAddress> & {
              value: SerializablePrimitive
            },
          ) {
            const tracks = _ensureTracksOfObject(p)
            const encodedPropPath = JSON.stringify(p.pathToProp)
            const trackId = tracks.trackIdByPropPath[encodedPropPath]

            if (typeof trackId !== 'string') return

            delete tracks.trackIdByPropPath[encodedPropPath]
            delete tracks.trackData[trackId]

            stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfPrimitiveProp(
              p,
            )
          }

          function _getTrack(
            p: WithoutSheetInstance<SheetObjectAddress> & {trackId: string},
          ) {
            return _ensureTracksOfObject(p).trackData[p.trackId]!
          }

          /**
           * Sets a keyframe at the exact specified position.
           * Any position snapping should be done by the caller.
           */
          export function setKeyframeAtPosition(
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: string
              position: number
              value: number
            },
          ) {
            const {keyframes} = _getTrack(p)
            const existingKeyframeIndex = keyframes.findIndex(
              (kf) => kf.position === p.position,
            )
            if (existingKeyframeIndex !== -1) {
              const kf = keyframes[existingKeyframeIndex]
              kf.value = p.value
              return
            }
            const indexOfLeftKeyframe = findLastIndex(
              keyframes,
              (kf) => kf.position < p.position,
            )
            if (indexOfLeftKeyframe === -1) {
              keyframes.unshift({
                id: generateKeyframeId(),
                position: p.position,
                connectedRight: true,
                handles: [0.5, 1, 0.5, 0],
                value: p.value,
              })
              return
            }
            const leftKeyframe = keyframes[indexOfLeftKeyframe]
            keyframes.splice(indexOfLeftKeyframe + 1, 0, {
              id: generateKeyframeId(),
              position: p.position,
              connectedRight: leftKeyframe.connectedRight,
              handles: [0.5, 1, 0.5, 0],
              value: p.value,
            })
          }

          export function unsetKeyframeAtPosition(
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: string
              position: number
            },
          ) {
            const {keyframes} = _getTrack(p)
            const index = keyframes.findIndex(
              (kf) => kf.position === p.position,
            )
            if (index === -1) return

            keyframes.splice(index, 1)
          }

          export function transformKeyframes(
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: string
              keyframeIds: KeyframeId[]
              translate: number
              scale: number
              origin: number
            },
          ) {
            const track = _getTrack(p)
            const initialKeyframes = current(track.keyframes)
            // debugger

            const selectedKeyframes = initialKeyframes.filter(
              (kf) => p.keyframeIds.indexOf(kf.id) !== -1,
            )

            const transformed = selectedKeyframes.map((untransformedKf) => {
              const oldPosition = untransformedKf.position
              const newPosition = transformNumber(oldPosition, p)
              return {...untransformedKf, position: newPosition}
            })

            replaceKeyframes({...p, keyframes: transformed})
          }

          export function deleteKeyframes(
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: string
              keyframeIds: KeyframeId[]
            },
          ) {
            const track = _getTrack(p)

            track.keyframes = track.keyframes.filter(
              (kf) => p.keyframeIds.indexOf(kf.id) === -1,
            )
          }

          export function replaceKeyframes(
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: string
              keyframes: Array<Keyframe>
            },
          ) {
            const track = _getTrack(p)
            const initialKeyframes = current(track.keyframes)
            const sanitizedKeyframes = p.keyframes.filter((kf) => {
              if (!isFinite(kf.value)) return false
              if (!kf.handles.every((handleValue) => isFinite(handleValue)))
                return false

              return true
            })

            const newKeyframesById = keyBy(sanitizedKeyframes, 'id')

            const unselected = initialKeyframes.filter(
              (kf) => !newKeyframesById[kf.id],
            )

            const unselectedByPositino = keyBy(unselected, 'position')

            // If the new transformed keyframes overlap with any existing keyframes,
            // we remove the overlapped keyframes
            sanitizedKeyframes.forEach(({position}) => {
              const existingKeyframeAtThisPosition =
                unselectedByPositino[position]
              if (existingKeyframeAtThisPosition) {
                pullFromArray(unselected, existingKeyframeAtThisPosition)
              }
            })

            const sorted = sortBy(
              [...unselected, ...sanitizedKeyframes],
              'position',
            )

            track.keyframes = sorted
          }
        }

        export namespace staticOverrides {
          export namespace byObject {
            function _ensure(p: WithoutSheetInstance<SheetObjectAddress>) {
              const byObject =
                stateEditors.coreByProject.historic.sheetsById._ensure(p)
                  .staticOverrides.byObject
              byObject[p.objectKey] ??= {}
              return byObject[p.objectKey]!
            }

            export function setValueOfPrimitiveProp(
              p: WithoutSheetInstance<PropAddress> & {
                value: SerializablePrimitive
              },
            ) {
              const existingOverrides = _ensure(p)
              set(existingOverrides, p.pathToProp, p.value)
            }

            export function unsetValueOfPrimitiveProp(
              p: WithoutSheetInstance<PropAddress>,
            ) {
              const existingStaticOverrides =
                stateEditors.coreByProject.historic.sheetsById._ensure(p)
                  .staticOverrides.byObject[p.objectKey]

              if (!existingStaticOverrides) return

              removePathFromObject(existingStaticOverrides, p.pathToProp)
            }
          }
        }
      }
    }
  }
}

export type IStateEditors = typeof stateEditors
