import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import {usePrism} from '@theatre/react'
import type {
  $IntentionalAny,
  SerializablePrimitive,
  VoidFn,
} from '@theatre/shared/utils/types'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import get from 'lodash-es/get'
import last from 'lodash-es/last'
import React from 'react'
import DefaultOrStaticValueIndicator from './DefaultValueIndicator'
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {
  compoundHasSimpleDescendants,
  isPropConfigComposite,
  iteratePropType,
} from '@theatre/shared/propTypes/utils'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {IPropPathToTrackIdTree} from '@theatre/core/sheetObjects/SheetObjectTemplate'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import NextPrevKeyframeCursorsNew from './NextPrevKeyframeCursorsNew'

interface CommonStuff<T> {
  beingScrubbed: boolean
  contextMenuItems: Array<IContextMenuItem>
  controlIndicators: React.ReactElement
}

/**
 * For compounds that have _no_ sequenced track in all of their descendants
 */
interface AllStatic<T> extends CommonStuff<T> {
  type: 'AllStatic'
}

/**
 * For compounds that have at least one sequenced track in their descendants
 */
interface HasSequences<T> extends CommonStuff<T> {
  type: 'HasSequences'
  nearbyKeyframes: NearbyKeyframes
}

type Stuff<T> = AllStatic<T> | HasSequences<T>

export function useEditingToolsForCompoundProp<T extends SerializablePrimitive>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_Compound<{}>,
): Stuff<T> {
  return usePrism((): Stuff<T> => {
    // if the compound has no simple descendants, then there isn't much the user can do with it
    if (!compoundHasSimpleDescendants(propConfig)) {
      return {
        type: 'AllStatic',
        beingScrubbed: false,
        contextMenuItems: [],
        controlIndicators: (
          <DefaultOrStaticValueIndicator hasStaticOverride={false} />
        ),
      }
    }

    const pathToProp = getPointerParts(pointerToProp).path

    /**
     * TODO This implementation is wrong because {@link stateEditors.studio.ephemeral.projects.stateByProjectId.stateBySheetId.stateByObjectKey.propsBeingScrubbed.flag}
     * does not prune empty objects
     */
    const someDescendantsBeingScrubbed = !!val(
      get(
        getStudio()!.atomP.ephemeral.projects.stateByProjectId[
          obj.address.projectId
        ].stateBySheetId[obj.address.sheetId].stateByObjectKey[
          obj.address.objectKey
        ].valuesBeingScrubbed,
        getPointerParts(pointerToProp).path,
      ),
    )

    const contextMenuItems: IContextMenuItem[] = []

    const common: CommonStuff<T> = {
      beingScrubbed: someDescendantsBeingScrubbed,
      contextMenuItems,
      controlIndicators: <></>,
    }

    const validSequencedTracks = val(
      obj.template.getMapOfValidSequenceTracks_forStudio(),
    )

    const possibleSequenceTrackIds = getDeep(
      validSequencedTracks,
      pathToProp,
    ) as undefined | IPropPathToTrackIdTree

    const hasOneOrMoreSequencedTracks = !!possibleSequenceTrackIds
    const listOfDescendantTrackIds: SequenceTrackId[] = []

    let hasOneOrMoreStatics = true
    if (hasOneOrMoreSequencedTracks) {
      hasOneOrMoreStatics = false
      for (const descendant of iteratePropType(propConfig, [])) {
        if (isPropConfigComposite(descendant.conf)) continue
        const sequencedTrackIdBelongingToDescendant = getDeep(
          possibleSequenceTrackIds,
          descendant.path,
        ) as SequenceTrackId | undefined
        if (typeof sequencedTrackIdBelongingToDescendant !== 'string') {
          hasOneOrMoreStatics = true
        } else {
          listOfDescendantTrackIds.push(sequencedTrackIdBelongingToDescendant)
        }
      }
    }

    if (hasOneOrMoreStatics) {
      contextMenuItems.push(
        /**
         * TODO This is surely confusing for the user if the descendants don't have overrides.
         */
        {
          label: 'Reset all to default',
          callback: () => {
            getStudio()!.transaction(({unset}) => {
              unset(pointerToProp)
            })
          },
        },
        {
          label: 'Sequence all',
          callback: () => {
            getStudio()!.transaction(({stateEditors}) => {
              for (const {path, conf} of iteratePropType(
                propConfig,
                pathToProp,
              )) {
                if (isPropConfigComposite(conf)) continue
                const propAddress = {...obj.address, pathToProp: path}

                stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsSequenced(
                  propAddress,
                  propConfig,
                )
              }
            })
          },
        },
      )
    }

    if (hasOneOrMoreSequencedTracks) {
      contextMenuItems.push({
        label: 'Make all static',
        callback: () => {
          getStudio()!.transaction(({stateEditors}) => {
            for (const {path: subPath, conf} of iteratePropType(
              propConfig,
              [],
            )) {
              if (isPropConfigComposite(conf)) continue
              const propAddress = {
                ...obj.address,
                pathToProp: [...pathToProp, ...subPath],
              }
              const pointerToSub = pointerDeep(pointerToProp, subPath)

              stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsStatic(
                {
                  ...propAddress,
                  value: obj.getValueByPointer(pointerToSub as $IntentionalAny),
                },
              )
            }
          })
        },
      })
    }

    if (hasOneOrMoreSequencedTracks) {
      const sequenceTrackId = possibleSequenceTrackIds
      const nearbyKeyframes = prism.sub(
        'lcr',
        (): NearbyKeyframes => {
          const sequencePosition = val(
            obj.sheet.getSequence().positionDerivation,
          )

          const s = listOfDescendantTrackIds
            .map((trackId) => ({
              trackId,
              track: val(
                obj.template.project.pointers.historic.sheetsById[
                  obj.address.sheetId
                ].sequence.tracksByObject[obj.address.objectKey].trackData[
                  trackId
                ],
              ),
            }))
            .filter(({track}) => !!track)
            .map((s) => ({
              ...s,
              nearbies: getNearbyKeyframesOfTrack(s.track, sequencePosition),
            }))

          const hasCur = s.find(({nearbies}) => !!nearbies.cur)
          const allCur = s.every(({nearbies}) => !!nearbies.cur)

          const closestPrev = s.reduce<undefined | number>((acc, s) => {
            if (s.nearbies.prev) {
              if (acc === undefined) {
                return s.nearbies.prev.position
              } else {
                return Math.max(s.nearbies.prev.position, acc)
              }
            } else {
              return acc
            }
          }, undefined)

          const closestNext = s.reduce<undefined | number>((acc, s) => {
            if (s.nearbies.next) {
              if (acc === undefined) {
                return s.nearbies.next.position
              } else {
                return Math.min(s.nearbies.next.position, acc)
              }
            } else {
              return acc
            }
          }, undefined)

          return {
            cur: {
              type: hasCur ? 'on' : 'off',
              toggle: () => {
                if (allCur) {
                  getStudio().transaction((api) => {
                    api.unset(pointerToProp)
                  })
                } else if (hasCur) {
                  getStudio().transaction((api) => {
                    api.set(pointerToProp, val(pointerToProp))
                  })
                } else {
                  getStudio().transaction((api) => {
                    api.set(pointerToProp, val(pointerToProp))
                  })
                }
              },
            },
            prev:
              closestPrev !== undefined
                ? {
                    position: closestPrev,
                    jump: () => {
                      obj.sheet.getSequence().position = closestPrev
                    },
                  }
                : undefined,
            next:
              closestNext !== undefined
                ? {
                    position: closestNext,
                    jump: () => {
                      obj.sheet.getSequence().position = closestNext
                    },
                  }
                : undefined,
          }
        },
        [sequenceTrackId],
      )

      const nextPrevKeyframeCursors = (
        <NextPrevKeyframeCursorsNew {...nearbyKeyframes} />
      )

      const ret: HasSequences<T> = {
        ...common,
        type: 'HasSequences',
        nearbyKeyframes,
        controlIndicators: nextPrevKeyframeCursors,
      }

      return ret
    } else {
      return {
        ...common,
        type: 'AllStatic',
        controlIndicators: (
          // todo
          <DefaultOrStaticValueIndicator hasStaticOverride={false} />
        ),
      }
    }
  }, [])
}

type NearbyKeyframes = {
  prev?: Pick<Keyframe, 'position'> & {jump: VoidFn}
  cur: {type: 'on'; toggle: VoidFn} | {type: 'off'; toggle: VoidFn}
  next?: Pick<Keyframe, 'position'> & {jump: VoidFn}
}

function getNearbyKeyframesOfTrack(
  track: TrackData | undefined,
  sequencePosition: number,
): {
  prev?: Keyframe
  cur?: Keyframe
  next?: Keyframe
} {
  if (!track || track.keyframes.length === 0) return {}

  const i = track.keyframes.findIndex((kf) => kf.position >= sequencePosition)

  if (i === -1)
    return {
      prev: last(track.keyframes),
    }

  const k = track.keyframes[i]!
  if (k.position === sequencePosition) {
    return {
      prev: i > 0 ? track.keyframes[i - 1] : undefined,
      cur: k,
      next:
        i === track.keyframes.length - 1 ? undefined : track.keyframes[i + 1],
    }
  } else {
    return {
      next: k,
      prev: i > 0 ? track.keyframes[i - 1] : undefined,
    }
  }
}
