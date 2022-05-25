import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import {usePrism} from '@theatre/react'
import type {
  $IntentionalAny,
  SerializablePrimitive,
} from '@theatre/shared/utils/types'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import get from 'lodash-es/get'
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
import type {NearbyKeyframesControls} from './NextPrevKeyframeCursors'
import NextPrevKeyframeCursors from './NextPrevKeyframeCursors'
import {getNearbyKeyframesOfTrack} from './getNearbyKeyframesOfTrack'

interface CommonStuff {
  beingScrubbed: boolean
  contextMenuItems: Array<IContextMenuItem>
  controlIndicators: React.ReactElement
}

/**
 * For compounds that have _no_ sequenced track in all of their descendants
 */
interface AllStatic extends CommonStuff {
  type: 'AllStatic'
}

/**
 * For compounds that have at least one sequenced track in their descendants
 */
interface HasSequences extends CommonStuff {
  type: 'HasSequences'
}

type Stuff = AllStatic | HasSequences

export function useEditingToolsForCompoundProp<T extends SerializablePrimitive>(
  pointerToProp: Pointer<{}>,
  obj: SheetObject,
  propConfig: PropTypeConfig_Compound<{}>,
): Stuff {
  return usePrism((): Stuff => {
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

    const common: CommonStuff = {
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
      const nearbyKeyframeControls = prism.sub(
        'lcr',
        (): NearbyKeyframesControls => {
          const sequencePosition = val(
            obj.sheet.getSequence().positionDerivation,
          )

          /* 
          2/10 perf concern: 
          When displaying a hierarchy like {props: {transform: {position: {x, y, z}}}},
          we'd be recalculating this variable for both `position` and `transform`. While
          we _could_ be re-using the calculation of `transform` in `position`, I think
          it's unlikely that this optimization would matter.
          */
          const nearbyKeyframesInEachTrack = listOfDescendantTrackIds
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

          const hasCur = nearbyKeyframesInEachTrack.find(
            ({nearbies}) => !!nearbies.cur,
          )
          const allCur = nearbyKeyframesInEachTrack.every(
            ({nearbies}) => !!nearbies.cur,
          )

          const closestPrev = nearbyKeyframesInEachTrack.reduce<
            undefined | number
          >((acc, s) => {
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

          const closestNext = nearbyKeyframesInEachTrack.reduce<
            undefined | number
          >((acc, s) => {
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
        <NextPrevKeyframeCursors {...nearbyKeyframeControls} />
      )

      const ret: HasSequences = {
        ...common,
        type: 'HasSequences',
        controlIndicators: nextPrevKeyframeCursors,
      }

      return ret
    } else {
      return {
        ...common,
        type: 'AllStatic',
        controlIndicators: (
          <DefaultOrStaticValueIndicator hasStaticOverride={false} />
        ),
      }
    }
  }, [])
}
