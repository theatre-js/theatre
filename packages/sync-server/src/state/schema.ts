import type {
  BasicKeyframedTrack,
  HistoricPositionalSequence,
  SheetState_Historic,
  StudioSheetItemKey,
  UIPanelId,
  GraphEditorColors,
} from '@theatre/core/types/private'

import type {
  ProjectAddress,
  PropAddress,
  SheetAddress,
  SheetObjectAddress,
  WithoutSheetInstance,
  KeyframeId,
  SequenceTrackId,
  PaneInstanceId,
  BasicKeyframe,
  KeyframeType,
  SequenceMarkerId,
  SerializableMap,
  SerializablePrimitive,
  SerializableValue,
  IRange,
} from '@theatre/core/types/public'

import {
  encodePathToProp,
  commonRootOfPathsToProps,
} from '@theatre/utils/pathToProp'
import removePathFromObject from '@theatre/utils/removePathFromObject'
import {transformNumber} from '@theatre/utils/transformNumber'
import type {$IntentionalAny} from '@theatre/utils/types'
import findLastIndex from 'lodash-es/findLastIndex'
import keyBy from 'lodash-es/keyBy'
import pullFromArray from 'lodash-es/pull'
import set from 'lodash-es/set'
import type {
  KeyframeWithPathToPropFromCommonRoot,
  OutlineSelectionState,
  PaneInstanceDescriptor,
  PanelPosition,
  StudioAhistoricState,
  StudioHistoricStateSequenceEditorMarker,
  StudioState,
} from '@theatre/core/types/private/studio'
import {clamp, cloneDeep} from 'lodash-es'
import {pointableSetUtil} from '@theatre/utils/PointableSet'
import type {ProjectState_Historic} from '@theatre/core/types/private/core'
import {current} from '@theatre/saaz'
import type {Draft as _Draft} from 'immer'
import type {
  EditorDefinitionToEditorInvocable,
  Schema,
} from '@theatre/saaz/src/types'
import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import {__private} from '@theatre/core'

const {keyframeUtils} = __private

export const graphEditorColors: GraphEditorColors = {
  '1': {iconColor: '#b98b08'},
  '2': {iconColor: '#70a904'},
  '3': {iconColor: '#2e928a'},
  '4': {iconColor: '#a943bb'},
  '5': {iconColor: '#b90808'},
  '6': {iconColor: '#b4bf0e'},
}

function rand() {
  return Math.random()
}

function generateKeyframeId(): KeyframeId {
  return generateNonSecure(10) as KeyframeId
}

function generateSequenceTrackId(): SequenceTrackId {
  return generateNonSecure(10) as SequenceTrackId
}

const generators = {
  rand,
  generateKeyframeId,
  generateSequenceTrackId,
} as const

export type StateEditorsAPI = {}

type Draft = _Draft<StudioState>
type API = StateEditorsAPI

const initialState: StudioState = {
  $schemaVersion: 1,
  ahistoric: {
    // visibilityState: 'everythingIsVisible',
    projects: {
      stateByProjectId: {},
    },
  },
  historic: {
    projects: {
      stateByProjectId: {},
    },
    coreByProject: {},
    panelInstanceDesceriptors: {},
  },
  ephemeral: {
    projects: {
      stateByProjectId: {},
    },
  },
}

export namespace stateEditors {
  function _ensureAll(draft: Draft): Required<StudioState> {
    draft.ahistoric ??= initialState.ahistoric
    draft.historic ??= initialState.historic
    draft.ephemeral ??= initialState.ephemeral
    return draft as Required<StudioState>
  }
  export namespace studio {
    export namespace historic {
      export namespace panelPositions {
        export function setPanelPosition(
          draft: Draft,
          api: API,
          p: {
            panelId: UIPanelId
            position: PanelPosition
          },
        ) {
          const h = _ensureAll(draft).historic
          h.panelPositions ??= {}
          h.panelPositions[p.panelId] = p.position
        }
      }

      export namespace panelInstanceDescriptors {
        export function setDescriptor(
          draft: Draft,
          api: API,
          {instanceId, paneClass}: PaneInstanceDescriptor,
        ) {
          _ensureAll(draft).historic.panelInstanceDesceriptors[instanceId] = {
            instanceId,
            paneClass,
          }
        }

        export function remove(
          draft: Draft,
          api: API,
          p: {instanceId: PaneInstanceId},
        ) {
          delete _ensureAll(draft).historic.panelInstanceDesceriptors[
            p.instanceId
          ]
        }
      }
      export namespace panels {
        export function _ensure(draft: Draft, api: API) {
          _ensureAll(draft).historic.panels ??= {}
          return _ensureAll(draft).historic.panels!
        }

        export namespace outline {
          export function _ensure(draft: Draft, api: API) {
            const panels = stateEditors.studio.historic.panels._ensure(
              draft,
              api,
            )
            panels.outlinePanel ??= {}
            return panels.outlinePanel!
          }
          export namespace selection {
            export function set(
              draft: Draft,
              api: API,
              selection: Array<OutlineSelectionState>,
            ) {
              outline._ensure(draft, api).selection = selection
            }

            export function unset(draft: Draft, api: API) {
              outline._ensure(draft, api).selection = []
            }
          }
        }

        export namespace sequenceEditor {
          export function _ensure(draft: Draft, api: API) {
            const panels = stateEditors.studio.historic.panels._ensure(
              draft,
              api,
            )
            panels.sequenceEditor ??= {}
            return panels.sequenceEditor!
          }
          export namespace graphEditor {
            function _ensure(draft: Draft, api: API) {
              const s = sequenceEditor._ensure(draft, api)
              s.graphEditor ??= {height: 0.5, isOpen: false}
              return s.graphEditor!
            }
            export function setIsOpen(
              draft: Draft,
              api: API,
              p: {isOpen: boolean},
            ) {
              _ensure(draft, api).isOpen = p.isOpen
            }
          }
        }
      }
      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(draft: Draft, api: API, p: ProjectAddress) {
            const s = _ensureAll(draft).historic
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace stateBySheetId {
            export function _ensure(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<SheetAddress>,
            ) {
              const projectState =
                stateEditors.studio.historic.projects.stateByProjectId._ensure(
                  draft,
                  api,
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

            export function setSelectedInstanceId(
              draft: Draft,
              api: API,
              p: SheetAddress,
            ) {
              stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId._ensure(
                draft,
                api,
                p,
              ).selectedInstanceId = p.sheetInstanceId
            }

            export namespace sequenceEditor {
              export function addPropToGraphEditor(
                draft: Draft,
                api: API,
                p: WithoutSheetInstance<PropAddress>,
              ) {
                const {selectedPropsByObject} = stateBySheetId._ensure(
                  draft,
                  api,
                  p,
                ).sequenceEditor
                if (!selectedPropsByObject[p.objectKey]) {
                  selectedPropsByObject[p.objectKey] = {}
                }
                const selectedProps = selectedPropsByObject[p.objectKey]!

                const path = encodePathToProp(p.pathToProp)

                const possibleColors = new Set<string>(
                  Object.keys(graphEditorColors),
                )
                for (const [_, selectedProps] of Object.entries(
                  selectedPropsByObject,
                )) {
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
                draft: Draft,
                api: API,
                p: WithoutSheetInstance<PropAddress>,
              ) {
                const {selectedPropsByObject} = stateBySheetId._ensure(
                  draft,
                  api,
                  p,
                ).sequenceEditor
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

              function _ensureMarkers(
                draft: Draft,
                api: API,
                sheetAddress: SheetAddress,
              ) {
                const sequenceEditor =
                  stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId._ensure(
                    draft,
                    api,
                    sheetAddress,
                  ).sequenceEditor

                if (!sequenceEditor.markerSet) {
                  sequenceEditor.markerSet = pointableSetUtil.create()
                }

                return sequenceEditor.markerSet
              }

              export function replaceMarkers(
                draft: Draft,
                api: API,
                p: {
                  sheetAddress: SheetAddress
                  markers: Array<StudioHistoricStateSequenceEditorMarker>
                  snappingFunction: (p: number) => number
                },
              ) {
                const currentMarkerSet = _ensureMarkers(
                  draft,
                  api,
                  p.sheetAddress,
                )

                const sanitizedMarkers = p.markers
                  .filter((marker) => {
                    if (!isFinite(marker.position)) return false

                    return true // marker looks valid
                  })
                  .map((marker) => ({
                    ...marker,
                    position: p.snappingFunction(marker.position),
                  }))

                const newMarkersById = keyBy(sanitizedMarkers, 'id')

                /** Usually starts as the "unselected" markers */
                let markersThatArentBeingReplaced = pointableSetUtil.filter(
                  currentMarkerSet,
                  (marker) => marker && !newMarkersById[marker.id],
                )

                const markersThatArentBeingReplacedByPosition = keyBy(
                  Object.values(markersThatArentBeingReplaced.byId),
                  'position',
                )

                // If the new transformed markers overlap with any existing markers,
                // we remove the overlapped markers
                sanitizedMarkers.forEach(({position}) => {
                  const existingMarkerAtThisPosition =
                    markersThatArentBeingReplacedByPosition[position]
                  if (existingMarkerAtThisPosition) {
                    markersThatArentBeingReplaced = pointableSetUtil.remove(
                      markersThatArentBeingReplaced,
                      existingMarkerAtThisPosition.id,
                    )
                  }
                })

                Object.assign(
                  currentMarkerSet,
                  pointableSetUtil.merge([
                    markersThatArentBeingReplaced,
                    pointableSetUtil.create(
                      sanitizedMarkers.map((marker) => [marker.id, marker]),
                    ),
                  ]),
                )
              }

              export function removeMarker(
                draft: Draft,
                api: API,
                options: {
                  sheetAddress: SheetAddress
                  markerId: SequenceMarkerId
                },
              ) {
                const currentMarkerSet = _ensureMarkers(
                  draft,
                  api,
                  options.sheetAddress,
                )
                Object.assign(
                  currentMarkerSet,
                  pointableSetUtil.remove(currentMarkerSet, options.markerId),
                )
              }

              export function updateMarker(
                draft: Draft,
                api: API,
                options: {
                  sheetAddress: SheetAddress
                  markerId: SequenceMarkerId
                  label: string
                },
              ) {
                const currentMarkerSet = _ensureMarkers(
                  draft,
                  api,
                  options.sheetAddress,
                )
                const marker = currentMarkerSet.byId[options.markerId]
                if (marker !== undefined) marker.label = options.label
              }
            }
          }
        }
      }
    }
    export namespace ephemeral {
      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(draft: Draft, api: API, p: ProjectAddress) {
            const s = _ensureAll(draft).ephemeral
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace stateBySheetId {
            export function _ensure(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<SheetAddress>,
            ) {
              const projectState =
                stateEditors.studio.ephemeral.projects.stateByProjectId._ensure(
                  draft,
                  api,
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
                draft: Draft,
                api: API,
                p: WithoutSheetInstance<SheetObjectAddress>,
              ) {
                const s =
                  stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId._ensure(
                    draft,
                    api,
                    p,
                  ).stateByObjectKey
                s[p.objectKey] ??= {}
                return s[p.objectKey]!
              }
              export namespace propsBeingScrubbed {
                export function _ensure(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetObjectAddress>,
                ) {
                  const s =
                    stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId.stateByObjectKey._ensure(
                      draft,
                      api,
                      p,
                    )

                  s.valuesBeingScrubbed ??= {}
                  return s.valuesBeingScrubbed!
                }
                export function flag(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<PropAddress>,
                ) {
                  set(_ensure(draft, api, p), p.pathToProp, true)
                }
              }
            }
          }
        }
      }
    }
    export namespace ahistoric {
      export function setPinOutline(
        draft: Draft,
        api: API,
        pinOutline: StudioAhistoricState['pinOutline'],
      ) {
        _ensureAll(draft).ahistoric.pinOutline = pinOutline
      }
      export function setPinDetails(
        draft: Draft,
        api: API,
        pinDetails: StudioAhistoricState['pinDetails'],
      ) {
        _ensureAll(draft).ahistoric.pinDetails = pinDetails
      }
      export function setPinNotifications(
        draft: Draft,
        api: API,
        pinNotifications: StudioAhistoricState['pinNotifications'],
      ) {
        _ensureAll(draft).ahistoric.pinNotifications = pinNotifications
      }
      export function setVisibilityState(
        draft: Draft,
        api: API,
        visibilityState: StudioAhistoricState['visibilityState'],
      ) {
        _ensureAll(draft).ahistoric.visibilityState = visibilityState
      }

      export function setClipboardKeyframes(
        draft: Draft,
        api: API,
        keyframes: KeyframeWithPathToPropFromCommonRoot[],
      ) {
        const commonPath = commonRootOfPathsToProps(
          keyframes.map((kf) => kf.pathToProp),
        )

        const keyframesWithCommonRootPath = keyframes.map(
          ({keyframe, pathToProp}) => ({
            keyframe,
            pathToProp: pathToProp.slice(commonPath.length),
          }),
        )

        const ahistoric = _ensureAll(draft).ahistoric
        // save selection
        if (ahistoric.clipboard) {
          ahistoric.clipboard.keyframesWithRelativePaths =
            keyframesWithCommonRootPath
        } else {
          _ensureAll(draft).ahistoric.clipboard = {
            keyframesWithRelativePaths: keyframesWithCommonRootPath,
          }
        }
      }

      export namespace projects {
        export namespace stateByProjectId {
          export function _ensure(draft: Draft, api: API, p: ProjectAddress) {
            const s = _ensureAll(draft).ahistoric
            if (!s.projects.stateByProjectId[p.projectId]) {
              s.projects.stateByProjectId[p.projectId] = {
                stateBySheetId: {},
              }
            }

            return s.projects.stateByProjectId[p.projectId]!
          }

          export namespace collapsedItemsInOutline {
            export function _ensure(draft: Draft, api: API, p: ProjectAddress) {
              const projectState =
                stateEditors.studio.ahistoric.projects.stateByProjectId._ensure(
                  draft,
                  api,
                  p,
                )
              if (!projectState.collapsedItemsInOutline) {
                projectState.collapsedItemsInOutline = {}
              }
              return projectState.collapsedItemsInOutline!
            }
            export function set(
              draft: Draft,
              api: API,
              p: ProjectAddress & {isCollapsed: boolean; itemKey: string},
            ) {
              const collapsedItemsInOutline =
                stateEditors.studio.ahistoric.projects.stateByProjectId.collapsedItemsInOutline._ensure(
                  draft,
                  api,
                  p,
                )

              if (p.isCollapsed) {
                collapsedItemsInOutline[p.itemKey] = true
              } else {
                delete collapsedItemsInOutline[p.itemKey]
              }
            }
          }

          export namespace stateBySheetId {
            export function _ensure(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<SheetAddress>,
            ) {
              const projectState =
                stateEditors.studio.ahistoric.projects.stateByProjectId._ensure(
                  draft,
                  api,
                  p,
                )
              if (!projectState.stateBySheetId[p.sheetId]) {
                projectState.stateBySheetId[p.sheetId] = {}
              }

              return projectState.stateBySheetId[p.sheetId]!
            }

            export namespace sequence {
              export function _ensure(
                draft: Draft,
                api: API,
                p: WithoutSheetInstance<SheetAddress>,
              ) {
                const sheetState =
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId._ensure(
                    draft,
                    api,
                    p,
                  )
                if (!sheetState.sequence) {
                  sheetState.sequence = {}
                }
                return sheetState.sequence!
              }

              export namespace focusRange {
                export function set(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetAddress> & {
                    range: IRange
                    enabled: boolean
                  },
                ) {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence._ensure(
                    draft,
                    api,
                    p,
                  ).focusRange = {range: p.range, enabled: p.enabled}
                }

                export function unset(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetAddress>,
                ) {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence._ensure(
                    draft,
                    api,
                    p,
                  ).focusRange = undefined
                }
              }

              export namespace clippedSpaceRange {
                export function set(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetAddress> & {
                    range: IRange
                  },
                ) {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence._ensure(
                    draft,
                    api,
                    p,
                  ).clippedSpaceRange = [...p.range]
                }
              }

              export namespace sequenceEditorCollapsableItems {
                function _ensure(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetAddress>,
                ) {
                  const seq =
                    stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence._ensure(
                      draft,
                      api,
                      p,
                    )
                  let existing = seq.collapsableItems
                  if (!existing) {
                    existing = seq.collapsableItems = pointableSetUtil.create()
                  }
                  return existing
                }
                export function set(
                  draft: Draft,
                  api: API,
                  p: WithoutSheetInstance<SheetAddress> & {
                    studioSheetItemKey: StudioSheetItemKey
                    isCollapsed: boolean
                  },
                ) {
                  const collapsableSet = _ensure(draft, api, p)
                  Object.assign(
                    collapsableSet,
                    pointableSetUtil.add(collapsableSet, p.studioSheetItemKey, {
                      isCollapsed: p.isCollapsed,
                    }),
                  )
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
      export function setProjectState(
        draft: Draft,
        api: API,
        p: ProjectAddress & {state: ProjectState_Historic},
      ) {
        _ensureAll(draft).historic.coreByProject[p.projectId] = cloneDeep(
          p.state,
        )
      }
      export namespace revisionHistory {
        export function add(
          draft: Draft,
          api: API,
          p: ProjectAddress & {revision: string},
        ) {
          const revisionHistory =
            _ensureAll(draft).historic.coreByProject[p.projectId]
              .revisionHistory

          const maxNumOfRevisionsToKeep = 50
          revisionHistory.unshift(p.revision)
          if (revisionHistory.length > maxNumOfRevisionsToKeep) {
            revisionHistory.length = maxNumOfRevisionsToKeep
          }
        }
      }
      export namespace sheetsById {
        export function _ensure(
          draft: Draft,
          api: API,
          p: WithoutSheetInstance<SheetAddress>,
        ): SheetState_Historic {
          const sheetsById =
            _ensureAll(draft).historic.coreByProject[p.projectId].sheetsById

          if (!sheetsById[p.sheetId]) {
            sheetsById[p.sheetId] = {staticOverrides: {byObject: {}}}
          }
          return sheetsById[p.sheetId]!
        }

        export function forgetObject(
          draft: Draft,
          api: API,
          p: WithoutSheetInstance<SheetObjectAddress>,
        ) {
          const sheetState =
            _ensureAll(draft).historic.coreByProject[p.projectId].sheetsById[
              p.sheetId
            ]
          if (!sheetState) return
          delete sheetState.staticOverrides.byObject[p.objectKey]

          const sequence = sheetState.sequence
          if (!sequence) return
          delete sequence.tracksByObject[p.objectKey]
        }

        export function forgetSheet(
          draft: Draft,
          api: API,
          p: WithoutSheetInstance<SheetAddress>,
        ) {
          const sheetState =
            _ensureAll(draft).historic.coreByProject[p.projectId].sheetsById[
              p.sheetId
            ]
          if (sheetState) {
            delete _ensureAll(draft).historic.coreByProject[p.projectId]
              .sheetsById[p.sheetId]
          }
        }

        export namespace sequence {
          export function _ensure(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetAddress>,
          ): HistoricPositionalSequence {
            const s = stateEditors.coreByProject.historic.sheetsById._ensure(
              draft,
              api,
              p,
            )
            s.sequence ??= {
              type: 'PositionalSequence',
              tracksByObject: {},
            }

            return s.sequence!
          }

          export function setLength(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetAddress> & {length: number},
          ) {
            _ensure(draft, api, p).length = clamp(
              parseFloat(p.length.toFixed(2)),
              0.01,
              Infinity,
            )
          }

          function _ensureTracksOfObject(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress>,
          ) {
            const s =
              stateEditors.coreByProject.historic.sheetsById.sequence._ensure(
                draft,
                api,
                p,
              ).tracksByObject

            s[p.objectKey] ??= {trackData: {}, trackIdByPropPath: {}}

            return s[p.objectKey]!
          }

          export function setPrimitivePropAsSequenced(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<PropAddress>,
          ) {
            const tracks = _ensureTracksOfObject(draft, api, p)
            const pathEncoded = encodePathToProp(p.pathToProp)
            const possibleTrackId = tracks.trackIdByPropPath[pathEncoded]
            if (typeof possibleTrackId === 'string') return

            const trackId = generators.generateSequenceTrackId()

            const track: BasicKeyframedTrack = {
              type: 'BasicKeyframedTrack',
              __debugName: `${p.objectKey}:${pathEncoded}`,
              keyframes: {allIds: {}, byId: {}},
            }

            tracks.trackData[trackId] = track
            tracks.trackIdByPropPath[pathEncoded] = trackId
          }

          export function setPrimitivePropAsStatic(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<PropAddress> & {
              value: SerializablePrimitive
            },
          ) {
            const tracks = _ensureTracksOfObject(draft, api, p)
            const encodedPropPath = encodePathToProp(p.pathToProp)
            const trackId = tracks.trackIdByPropPath[encodedPropPath]

            if (typeof trackId !== 'string') return

            delete tracks.trackIdByPropPath[encodedPropPath]
            delete tracks.trackData[trackId]

            stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfPrimitiveProp(
              draft,
              api,
              p,
            )
          }

          export function setCompoundPropAsStatic(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<PropAddress> & {
              value: SerializableMap
            },
          ) {
            const tracks = _ensureTracksOfObject(draft, api, p)

            for (const encodedPropPath of Object.keys(
              tracks.trackIdByPropPath,
            )) {
              const propPath = JSON.parse(encodedPropPath)
              const isSubOfTargetPath = p.pathToProp.every(
                (key, i) => propPath[i] === key,
              )
              if (isSubOfTargetPath) {
                const trackId = tracks.trackIdByPropPath[encodedPropPath]
                if (typeof trackId !== 'string') continue
                delete tracks.trackIdByPropPath[encodedPropPath]
                delete tracks.trackData[trackId]
              }
            }

            stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfCompoundProp(
              draft,
              api,
              p,
            )
          }

          function _getTrack(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
            },
          ) {
            return _ensureTracksOfObject(draft, api, p).trackData[p.trackId]
          }

          function _getKeyframeById(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeId: KeyframeId
            },
          ): BasicKeyframe | undefined {
            const track = _getTrack(draft, api, p)
            if (!track) return
            return track.keyframes.byId[p.keyframeId]
          }

          /**
           * Sets a keyframe at the exact specified position.
           * Any position snapping should be done by the caller.
           */
          export function setKeyframeAtPosition<T extends SerializableValue>(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              position: number
              handles?: [number, number, number, number]
              value: T
              snappingFunction: SnappingFunction
              type?: KeyframeType
            },
          ) {
            const position = p.snappingFunction(p.position)
            const track = _getTrack(draft, api, p)
            if (!track) return

            const prevById = current(track.keyframes)
            const keyframes = keyframeUtils.getSortedKeyframes(prevById)

            const existingKeyframeIndex = keyframes.findIndex(
              (kf) => kf.position === position,
            )

            if (existingKeyframeIndex !== -1) {
              const kf = keyframes[existingKeyframeIndex]
              track.keyframes.byId[kf.id]!.value = p.value
              return
            }

            const indexOfLeftKeyframe = findLastIndex(
              keyframes,
              (kf) => kf.position < position,
            )
            if (indexOfLeftKeyframe === -1) {
              keyframes.unshift({
                // generating the keyframe within the `setKeyframeAtPosition` makes it impossible for us
                // to make this business logic deterministic, which is important to guarantee for collaborative
                // editing.
                id: generators.generateKeyframeId(),
                position,
                connectedRight: true,
                handles: p.handles || [0.5, 1, 0.5, 0],
                type: p.type || 'bezier',
                value: p.value,
              })
              track.keyframes = keyframeUtils.fromArray(keyframes)
              return
            }
            const leftKeyframe = keyframes[indexOfLeftKeyframe]
            keyframes.splice(indexOfLeftKeyframe + 1, 0, {
              id: generators.generateKeyframeId(),
              position,
              connectedRight: leftKeyframe.connectedRight,
              handles: p.handles || [0.5, 1, 0.5, 0],
              type: p.type || 'bezier',
              value: p.value,
            })
            track.keyframes = keyframeUtils.fromArray(keyframes)
          }

          export function unsetKeyframeAtPosition(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              position: number
            },
          ) {
            const track = _getTrack(draft, api, p)
            if (!track) return
            const keyframes = keyframeUtils.getSortedKeyframes(
              current(track.keyframes),
            )
            const index = keyframes.findIndex(
              (kf) => kf.position === p.position,
            )
            if (index === -1) return

            keyframes.splice(index, 1)
            track.keyframes = keyframeUtils.fromArray(keyframes)
          }

          type SnappingFunction = (p: number) => number

          export function transformKeyframes(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeIds: KeyframeId[]
              translate: number
              scale: number
              origin: number
              snappingFunction: SnappingFunction
            },
          ) {
            const track = _getTrack(draft, api, p)
            if (!track) return
            const initialKeyframes = keyframeUtils.getSortedKeyframes(
              current(track.keyframes),
            )

            const selectedKeyframes = initialKeyframes.filter((kf) =>
              p.keyframeIds.includes(kf.id),
            )

            const transformed = selectedKeyframes.map((untransformedKf) => {
              const oldPosition = untransformedKf.position
              const newPosition = p.snappingFunction(
                transformNumber(oldPosition, p),
              )
              return {...untransformedKf, position: newPosition}
            })

            replaceKeyframes(draft, api, {...p, keyframes: transformed})
          }

          /**
           * Sets the easing between keyframes
           *
           * X = in keyframeIds
           * * = not in keyframeIds
           * + = modified handle
           * ```
           * X- --- -*- --- -X
           * X+ --- +*- --- -X+
           * ```
           *
           * TODO - explain further
           */
          export function setTweenBetweenKeyframes(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeIds: KeyframeId[]
              handles: [number, number, number, number]
            },
          ) {
            const track = _getTrack(draft, api, p)
            if (!track) return

            const sorted = keyframeUtils.getSortedKeyframes(
              current(track.keyframes),
            )
            sorted.map((kf, i) => {
              const prevKf = sorted[i - 1]
              const isBeingEdited = p.keyframeIds.includes(kf.id)
              const isAfterEditedKeyframe = p.keyframeIds.includes(prevKf?.id)

              if (isBeingEdited && !isAfterEditedKeyframe) {
                return {
                  ...kf,
                  handles: [
                    kf.handles[0],
                    kf.handles[1],
                    p.handles[0],
                    p.handles[1],
                  ],
                }
              } else if (isBeingEdited && isAfterEditedKeyframe) {
                return {
                  ...kf,
                  handles: [
                    p.handles[2],
                    p.handles[3],
                    p.handles[0],
                    p.handles[1],
                  ],
                }
              } else if (isAfterEditedKeyframe) {
                return {
                  ...kf,
                  handles: [
                    p.handles[2],
                    p.handles[3],
                    kf.handles[2],
                    kf.handles[3],
                  ],
                }
              } else {
                return kf
              }
            })

            track.keyframes = keyframeUtils.fromArray(sorted)
          }

          export function setHandlesForKeyframe(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeId: KeyframeId
              start?: [number, number]
              end?: [number, number]
            },
          ) {
            const keyframe = _getKeyframeById(draft, api, p)
            if (keyframe) {
              keyframe.handles = [
                p.end?.[0] ?? keyframe.handles[0],
                p.end?.[1] ?? keyframe.handles[1],
                p.start?.[0] ?? keyframe.handles[2],
                p.start?.[1] ?? keyframe.handles[3],
              ]
            }
          }

          export function deleteKeyframes(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeIds: KeyframeId[]
            },
          ) {
            const track = _getTrack(draft, api, p)
            if (!track) return

            for (const keyframeId of p.keyframeIds) {
              delete track.keyframes.byId[keyframeId]
              delete track.keyframes.allIds[keyframeId]
            }
          }

          export function setKeyframeType(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframeId: KeyframeId
              keyframeType: KeyframeType
            },
          ) {
            const kf = _getKeyframeById(draft, api, p)
            if (kf) {
              kf.type = p.keyframeType
            }
          }

          // Future: consider whether a list of "partial" keyframes requiring `id` is possible to accept
          //  * Consider how common this pattern is, as this sort of concept would best be encountered
          //    a few times to start to see an opportunity for improved ergonomics / crdt.
          export function replaceKeyframes(
            draft: Draft,
            api: API,
            p: WithoutSheetInstance<SheetObjectAddress> & {
              trackId: SequenceTrackId
              keyframes: Array<BasicKeyframe>
              snappingFunction: SnappingFunction
            },
          ) {
            const track = _getTrack(draft, api, p)
            if (!track) return

            const sanitizedKeyframes = p.keyframes
              .filter((kf) => {
                if (typeof kf.value === 'number' && !isFinite(kf.value))
                  return false
                if (!kf.handles.every((handleValue) => isFinite(handleValue)))
                  return false

                return true
              })
              .map((kf) => ({...kf, position: p.snappingFunction(kf.position)}))

            const newKeyframesById = keyBy(sanitizedKeyframes, 'id')

            const initialKeyframes = keyframeUtils.getSortedKeyframes(
              current(track.keyframes),
            )
            const unselected = initialKeyframes.filter(
              (kf) => !newKeyframesById[kf.id],
            )

            const unselectedByPosition = keyBy(unselected, 'position')

            // If the new transformed keyframes overlap with any existing keyframes,
            // we remove the overlapped keyframes
            sanitizedKeyframes.forEach(({position}) => {
              const existingKeyframeAtThisPosition =
                unselectedByPosition[position]
              if (existingKeyframeAtThisPosition) {
                pullFromArray(unselected, existingKeyframeAtThisPosition)
              }
            })

            const unsorted = [...unselected, ...sanitizedKeyframes]
            // const sorted = sortBy(
            //   unsorted,
            //   'position',
            // )

            track.keyframes = keyframeUtils.fromArray(unsorted)
          }
        }

        export namespace staticOverrides {
          export namespace byObject {
            function _ensure(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<SheetObjectAddress>,
            ) {
              const byObject =
                stateEditors.coreByProject.historic.sheetsById._ensure(
                  draft,
                  api,
                  p,
                ).staticOverrides.byObject
              byObject[p.objectKey] ??= {}
              return byObject[p.objectKey]!
            }

            export function setValueOfCompoundProp(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<PropAddress> & {
                value: SerializableMap
              },
            ) {
              const existingOverrides = _ensure(draft, api, p)
              set(existingOverrides, p.pathToProp, p.value)
            }

            export function setValueOfPrimitiveProp(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<PropAddress> & {
                value: SerializablePrimitive
              },
            ) {
              const existingOverrides = _ensure(draft, api, p)
              set(existingOverrides, p.pathToProp, p.value)
            }

            export function unsetValueOfPrimitiveProp(
              draft: Draft,
              api: API,
              p: WithoutSheetInstance<PropAddress>,
            ) {
              const existingStaticOverrides =
                stateEditors.coreByProject.historic.sheetsById._ensure(
                  draft,
                  api,
                  p,
                ).staticOverrides.byObject[p.objectKey]

              if (!existingStaticOverrides) return

              removePathFromObject(existingStaticOverrides, p.pathToProp)
            }
          }
        }
      }
    }
  }
}

export type IStateEditors = {}
export type IInvokableStateEditors =
  EditorDefinitionToEditorInvocable<IStateEditors>

export type IInvokableDraftEditors = EditorDefinitionToEditorInvocable<
  typeof stateEditors
>

export const schema: Schema<{$schemaVersion: number}, IStateEditors, {}> = {
  opShape: null as $IntentionalAny as {$schemaVersion: number},
  version: 1,
  // migrateOp(s: $IntentionalAny) {
  //   s.$schemaVersion ??= 1
  //   return
  //   s.ahistoric ??= initialState.ahistoric
  //   s.historic ??= initialState.historic
  //   s.ephemeral ??= initialState.ephemeral
  // },
  // migrateCell(s: $IntentionalAny) {
  //   s.ahistoric ??= initialState.ahistoric
  //   s.historic ??= initialState.historic
  //   s.ephemeral ??= initialState.ephemeral
  // },
  editors: {},
  generators: {},
  cellShape: null as $IntentionalAny as StudioState,
}
