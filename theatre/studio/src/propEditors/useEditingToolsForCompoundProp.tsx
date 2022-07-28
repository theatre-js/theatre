import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import type {Pointer, IDerivation} from '@theatre/dataverse'
import get from 'lodash-es/get'
import React, {useMemo} from 'react'
import DefaultOrStaticValueIndicator from './DefaultValueIndicator'
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {
  compoundHasSimpleDescendants,
  isPropConfigComposite,
  iteratePropType,
} from '@theatre/shared/propTypes/utils'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {IPropPathToTrackIdTree} from '@theatre/core/sheetObjects/SheetObjectTemplate'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import type {NearbyKeyframesControls} from './NextPrevKeyframeCursors'
import NextPrevKeyframeCursors from './NextPrevKeyframeCursors'
import {getNearbyKeyframesOfTrack} from './getNearbyKeyframesOfTrack'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {prismRender} from '@theatre/studio/utils/derive-utils'

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

export function getEditingToolsForCompoundProp(
  pointerToProp: Pointer<{}>,
  obj: SheetObject,
  propConfig: PropTypeConfig_Compound<{}>,
): IDerivation<Stuff> {
  return prism((): Stuff => {
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

    const hasOneOrMoreSequencedTracks =
      possibleSequenceTrackIds !== undefined &&
      Object.keys(possibleSequenceTrackIds).length !== 0 // check if object is empty or undefined
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
      const controlIndicators = prism.memo(
        `controlIndicators`,
        () => (
          <ControlIndicators
            listOfDescendantTrackIds={listOfDescendantTrackIds}
            obj={obj}
            pointerToProp={pointerToProp}
          />
        ),
        [listOfDescendantTrackIds],
      )

      const ret: HasSequences = {
        ...common,
        type: 'HasSequences',
        controlIndicators,
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
  })
}

function ControlIndicators({
  pointerToProp,
  obj,
  listOfDescendantTrackIds,
}: {
  pointerToProp: Pointer<{}>
  obj: SheetObject
  listOfDescendantTrackIds: SequenceTrackId[]
}) {
  // memo so these accessors can be computed once and remain fast
  const deps = useMemo(
    () => ({
      pathToProp: getPointerParts(pointerToProp).path,
      positionD: obj.sheet.getSequence().positionDerivation,
      trackDataP:
        obj.template.project.pointers.historic.sheetsById[obj.address.sheetId]
          .sequence.tracksByObject[obj.address.objectKey].trackData,
    }),
    [obj, pointerToProp],
  )

  return usePrism(() => {
    const pathToProp = deps.pathToProp
    const sequencePosition = val(deps.positionD)

    /*
    2/10 perf concern:
    When displaying a hierarchy like {props: {transform: {position: {x, y, z}}}},
    we'd be recalculating this variable for both `position` and `transform`. While
    we _could_ be re-using the calculation of `transform` in `position`, I think
    it's unlikely that this optimization would matter.
    */
    const nearbyKfsD = prism(function collectNearbyKeyframesForCompound() {
      let hasCur = false
      let closestPrev: undefined | KeyframeWithTrack = undefined
      let closestNext: undefined | KeyframeWithTrack = undefined
      let allCur = listOfDescendantTrackIds.length !== 0
      // previously written as a series of functional methods, using a for loop is far faster, here.
      // pipelined in an effort to keep the playhead scrubbing fast.
      for (const trackId of listOfDescendantTrackIds) {
        const track = val(deps.trackDataP[trackId])
        if (!track) continue
        const nearbies = getNearbyKeyframesOfTrack(
          obj,
          {id: trackId, data: track},
          sequencePosition,
        )
        if (!hasCur && nearbies.cur) {
          hasCur = true
        }
        if (allCur && !nearbies.cur) {
          allCur = false
        }
        if (
          nearbies.prev &&
          (closestPrev == null ||
            closestPrev.kf.position < nearbies.prev.kf.position)
        ) {
          closestPrev = nearbies.prev
        }
        if (
          nearbies.next &&
          (closestNext == null ||
            closestNext.kf.position > nearbies.next.kf.position)
        ) {
          closestNext = nearbies.next
        }
      }
      return {
        closestNext,
        closestPrev,
        allCur,
        hasCur,
      }
    })

    const nearbyKeyframeControlsD = prism((): NearbyKeyframesControls => {
      const nearbyKfs = nearbyKfsD.getValue()
      const toggle = () => {
        if (nearbyKfs.allCur) {
          getStudio().transaction((api) => {
            api.unset(pointerToProp)
          })
        } else if (nearbyKfs.hasCur) {
          getStudio().transaction((api) => {
            api.set(pointerToProp, val(pointerToProp))
          })
        } else {
          getStudio().transaction((api) => {
            api.set(pointerToProp, val(pointerToProp))
          })
        }
      }
      return {
        cur: nearbyKfs.hasCur
          ? {
              type: 'on',
              itemKey:
                createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
                  obj,
                  pathToProp,
                  sequencePosition,
                ),
              toggle,
            }
          : {
              toggle,
              type: 'off',
            },
        prev:
          nearbyKfs.closestPrev !== undefined
            ? {
                position: nearbyKfs.closestPrev.kf.position,
                itemKey:
                  createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
                    obj,
                    pathToProp,
                    nearbyKfs.closestPrev.kf.position,
                  ),
                jump: () => {
                  obj.sheet.getSequence().position =
                    nearbyKfs.closestPrev!.kf.position
                },
              }
            : undefined,
        next:
          nearbyKfs.closestNext !== undefined
            ? {
                position: nearbyKfs.closestNext.kf.position,
                itemKey:
                  createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
                    obj,
                    pathToProp,
                    nearbyKfs.closestNext.kf.position,
                  ),
                jump: () => {
                  obj.sheet.getSequence().position =
                    nearbyKfs.closestNext!.kf.position
                },
              }
            : undefined,
      }
    })

    return prismRender(
      () => <NextPrevKeyframeCursors {...nearbyKeyframeControlsD.getValue()} />,
      [nearbyKeyframeControlsD],
    )
  }, [deps, obj, listOfDescendantTrackIds])
}
