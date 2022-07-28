import get from 'lodash-es/get'
import React from 'react'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type Scrub from '@theatre/studio/Scrub'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import type {
  $IntentionalAny,
  SerializablePrimitive as SerializablePrimitive,
} from '@theatre/shared/utils/types'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import {isPropConfSequencable} from '@theatre/shared/propTypes/utils'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import DefaultOrStaticValueIndicator from './DefaultValueIndicator'
import type {NearbyKeyframes} from './getNearbyKeyframesOfTrack'
import {getNearbyKeyframesOfTrack} from './getNearbyKeyframesOfTrack'
import type {NearbyKeyframesControls} from './NextPrevKeyframeCursors'
import NextPrevKeyframeCursors from './NextPrevKeyframeCursors'
import {prismRender} from '@theatre/studio/utils/derive-utils'

interface EditingToolsCommon<T> {
  valueD: IDerivation<T>
  beingScrubbedD: IDerivation<boolean>
  contextMenuItems: Array<IContextMenuItem>
  /** e.g. `< • >` or `<   >` for {@link EditingToolsSequenced} */
  controlIndicators: React.ReactElement

  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permanentlySetValue(v: T): void
}

interface EditingToolsDefault<T> extends EditingToolsCommon<T> {
  type: 'Default'
  shadeD: IDerivation<Shade>
}

interface EditingToolsStatic<T> extends EditingToolsCommon<T> {
  type: 'Static'
  shadeD: IDerivation<Shade>
}

interface EditingToolsSequenced<T> extends EditingToolsCommon<T> {
  type: 'Sequenced'
  shadeD: IDerivation<Shade>
  /** based on the position of the playhead */
  nearbyKeyframesD: IDerivation<NearbyKeyframes>
}

export type EditingToolsForSimplePropInDetailsPanel<T> =
  | EditingToolsDefault<T>
  | EditingToolsStatic<T>
  | EditingToolsSequenced<T>

const cache = new WeakMap<
  {},
  IDerivation<EditingToolsForSimplePropInDetailsPanel<$IntentionalAny>>
>()

/**
 * Note: we're able to get `obj` and `propConfig` from `pointerToProp`,
 * so the only reason they're still in the arguments list is that
 */
function createDerivation<T extends SerializablePrimitive>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_AllSimples,
): IDerivation<EditingToolsForSimplePropInDetailsPanel<T>> {
  return prism(() => {
    const pathToProp = getPointerParts(pointerToProp).path

    const editPropValue = prism.memo(
      'editPropValue',
      () => {
        let currentScrub: Scrub | null = null

        return {
          temporarilySetValue(v: T): void {
            if (!currentScrub) {
              currentScrub = getStudio()!.scrub()
            }
            currentScrub.capture((api) => {
              api.set(pointerToProp, v)
            })
          },
          discardTemporaryValue(): void {
            if (currentScrub) {
              currentScrub.discard()
              currentScrub = null
            }
          },
          permanentlySetValue(v: T): void {
            if (currentScrub) {
              currentScrub.capture((api) => {
                api.set(pointerToProp, v)
              })
              currentScrub.commit()
              currentScrub = null
            } else {
              getStudio()!.transaction((api) => {
                api.set(pointerToProp, v)
              })
            }
          },
        }
      },
      [],
    )

    const beingScrubbedD = prism(
      () =>
        true ===
        val(
          get(
            getStudio()!.atomP.ephemeral.projects.stateByProjectId[
              obj.address.projectId
            ].stateBySheetId[obj.address.sheetId].stateByObjectKey[
              obj.address.objectKey
            ].valuesBeingScrubbed,
            getPointerParts(pointerToProp).path,
          ),
        ),
    )

    const contextMenuItems: IContextMenuItem[] = []

    const common: EditingToolsCommon<T> = {
      ...editPropValue,
      valueD: prism(() => obj.getValueByPointer(pointerToProp) as T),
      beingScrubbedD,
      contextMenuItems,
      controlIndicators: <></>,
    }

    const isSequencable = isPropConfSequencable(propConfig)

    if (isSequencable) {
      const validSequencedTracks = val(
        obj.template.getMapOfValidSequenceTracks_forStudio(),
      )
      const possibleSequenceTrackId = getDeep(validSequencedTracks, pathToProp)

      const isSequenced = typeof possibleSequenceTrackId === 'string'

      if (isSequenced) {
        contextMenuItems.push({
          label: 'Make static',
          callback: () => {
            getStudio()!.transaction(({stateEditors}) => {
              const propAddress = {...obj.address, pathToProp}
              stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsStatic(
                {
                  ...propAddress,
                  value: obj.getValueByPointer(pointerToProp) as T,
                },
              )
            })
          },
        })

        const sequenceTrackId = possibleSequenceTrackId as SequenceTrackId
        const nearbyKeyframesD = prism(() =>
          prism
            .memo(
              'lcr',
              (): IDerivation<NearbyKeyframes> =>
                prism(() => {
                  const track = val(
                    obj.template.project.pointers.historic.sheetsById[
                      obj.address.sheetId
                    ].sequence.tracksByObject[obj.address.objectKey].trackData[
                      sequenceTrackId
                    ],
                  )
                  const sequencePosition = val(
                    obj.sheet.getSequence().positionDerivation,
                  )
                  return track
                    ? getNearbyKeyframesOfTrack(
                        obj,
                        {
                          data: track,
                          id: sequenceTrackId,
                        },
                        sequencePosition,
                      )
                    : {}
                }),
              [sequenceTrackId],
            )
            .getValue(),
        )

        const shadeD = prism((): Shade => {
          if (common.beingScrubbedD.getValue()) {
            return 'Sequenced_OnKeyframe_BeingScrubbed'
          } else {
            const nearbyKeyframes = nearbyKeyframesD.getValue()
            if (nearbyKeyframes.cur) {
              return 'Sequenced_OnKeyframe'
            } else if (nearbyKeyframes.prev?.kf.connectedRight === true) {
              return 'Sequenced_BeingInterpolated'
            } else {
              return 'Sequened_NotBeingInterpolated'
            }
          }
        })

        const controlsD = prism(() => {
          const nearbyKeyframes = nearbyKeyframesD.getValue()
          const toggle = () => {
            if (nearbyKeyframes.cur) {
              getStudio()!.transaction((api) => {
                api.unset(pointerToProp)
              })
            } else {
              getStudio()!.transaction((api) => {
                api.set(pointerToProp, common.valueD.getValue())
              })
            }
          }

          const controls: NearbyKeyframesControls = {
            cur: nearbyKeyframes.cur
              ? {
                  type: 'on',
                  itemKey: nearbyKeyframes.cur.itemKey,
                  toggle,
                }
              : {
                  type: 'off',
                  toggle,
                },
            prev:
              nearbyKeyframes.prev !== undefined
                ? {
                    itemKey: nearbyKeyframes.prev.itemKey,
                    position: nearbyKeyframes.prev.kf.position,
                    jump: () => {
                      obj.sheet.getSequence().position =
                        nearbyKeyframes.prev!.kf.position
                    },
                  }
                : undefined,
            next:
              nearbyKeyframes.next !== undefined
                ? {
                    itemKey: nearbyKeyframes.next.itemKey,
                    position: nearbyKeyframes.next.kf.position,
                    jump: () => {
                      obj.sheet.getSequence().position =
                        nearbyKeyframes.next!.kf.position
                    },
                  }
                : undefined,
          }

          return controls
        })

        const nextPrevKeyframeCursors = prismRender(
          () => <NextPrevKeyframeCursors {...controlsD.getValue()} />,
          [controlsD],
        )

        const ret: EditingToolsSequenced<T> = {
          ...common,
          type: 'Sequenced',
          shadeD,
          nearbyKeyframesD,
          controlIndicators: nextPrevKeyframeCursors,
        }

        return ret
      }
    }

    contextMenuItems.push({
      label: 'Reset to default',
      callback: () => {
        getStudio()!.transaction(({unset: unset}) => {
          unset(pointerToProp)
        })
      },
    })

    if (isSequencable) {
      contextMenuItems.push({
        label: 'Sequence',
        callback: () => {
          getStudio()!.transaction(({stateEditors}) => {
            const propAddress = {...obj.address, pathToProp}

            stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsSequenced(
              propAddress,
              propConfig,
            )
          })
        },
      })
    }

    const statics = val(obj.template.getStaticValues())

    if (typeof getDeep(statics, pathToProp) !== 'undefined') {
      const ret: EditingToolsStatic<T> = {
        ...common,
        type: 'Static',
        shadeD: prism(() =>
          common.beingScrubbedD.getValue() ? 'Static_BeingScrubbed' : 'Static',
        ),
        controlIndicators: (
          <DefaultOrStaticValueIndicator hasStaticOverride={true} />
        ),
      }
      return ret
    }

    const ret: EditingToolsDefault<T> = {
      ...common,
      type: 'Default',
      shadeD: prism(() => 'Default'),
      controlIndicators: (
        <DefaultOrStaticValueIndicator hasStaticOverride={false} />
      ),
    }

    return ret
  })
}

/**
 * Notably, this uses the {@link Scrub} API to support
 * indicating in the UI which pointers (values/props) are being
 * scrubbed. See how impl of {@link Scrub} manages
 * `state.flagsTransaction` to keep a list of these touched paths
 * for the UI to be able to recognize. (e.g. to highlight the
 * item in r3f as you change its scale).
 */
export function getEditingToolsForSimplePropInDetailsPanel<
  T extends SerializablePrimitive,
>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_AllSimples,
): IDerivation<EditingToolsForSimplePropInDetailsPanel<T>> {
  if (cache.has(pointerToProp)) {
    return cache.get(pointerToProp)!
  } else {
    const d = createDerivation(pointerToProp, obj, propConfig)
    cache.set(pointerToProp, d)
    return d
  }
}

type Shade =
  | 'Default'
  | 'Static'
  | 'Static_BeingScrubbed'
  | 'Sequenced_OnKeyframe'
  | 'Sequenced_OnKeyframe_BeingScrubbed'
  | 'Sequenced_BeingInterpolated'
  | 'Sequened_NotBeingInterpolated'
