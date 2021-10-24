import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type Scrub from '@theatre/studio/Scrub'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import {usePrism} from '@theatre/react'
import type {$FixMe, SerializablePrimitive} from '@theatre/shared/utils/types'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import get from 'lodash-es/get'
import last from 'lodash-es/last'
import React from 'react'
import DefaultOrStaticValueIndicator from './DefaultValueIndicator'
import NextPrevKeyframeCursors from './NextPrevKeyframeCursors'
import type {PropTypeConfig} from '@theatre/core/propTypes'

interface CommonStuff<T> {
  value: T
  beingScrubbed: boolean
  contextMenuItems: Array<IContextMenuItem>
  controlIndicators: React.ReactElement

  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permenantlySetValue(v: T): void
}

interface Default<T> extends CommonStuff<T> {
  type: 'Default'
  shade: Shade
}

interface Static<T> extends CommonStuff<T> {
  type: 'Static'
  shade: Shade
}

interface Sequenced<T> extends CommonStuff<T> {
  type: 'Sequenced'
  shade: Shade
  nearbyKeyframes: NearbyKeyframes
}

type Stuff<T> = Default<T> | Static<T> | Sequenced<T>

export function useEditingToolsForPrimitiveProp<
  T extends SerializablePrimitive,
>(
  pointerToProp: SheetObject['propsP'],
  obj: SheetObject,
  propConfig: PropTypeConfig,
): Stuff<T> {
  return usePrism(() => {
    const pathToProp = getPointerParts(pointerToProp).path

    const final = obj.getValueByPointer(pointerToProp) as T

    const callbacks = prism.memo(
      'callbacks',
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
          permenantlySetValue(v: T): void {
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

    // const validSequenceTracks = val(
    //   obj.template.getMapOfValidSequenceTracks_forStudio(),
    // )

    const beingScrubbed =
      val(
        get(
          getStudio()!.atomP.ephemeral.projects.stateByProjectId[
            obj.address.projectId
          ].stateBySheetId[obj.address.sheetId].stateByObjectKey[
            obj.address.objectKey
          ].valuesBeingScrubbed,
          getPointerParts(pointerToProp).path,
        ),
      ) === true

    const contextMenuItems: IContextMenuItem[] = []

    const common: CommonStuff<T> = {
      ...callbacks,
      value: final,
      beingScrubbed,
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

        const sequenceTrcackId = possibleSequenceTrackId as $FixMe as string
        const nearbyKeyframes = prism.sub(
          'lcr',
          (): NearbyKeyframes => {
            const track = val(
              obj.template.project.pointers.historic.sheetsById[
                obj.address.sheetId
              ].sequence.tracksByObject[obj.address.objectKey].trackData[
                sequenceTrcackId
              ],
            )
            if (!track || track.keyframes.length === 0) return {}

            const pos = val(obj.sheet.getSequence().positionDerivation)

            const i = track.keyframes.findIndex((kf) => kf.position >= pos)

            if (i === -1)
              return {
                prev: last(track.keyframes),
              }

            const k = track.keyframes[i]!
            if (k.position === pos) {
              return {
                prev: i > 0 ? track.keyframes[i - 1] : undefined,
                cur: k,
                next:
                  i === track.keyframes.length - 1
                    ? undefined
                    : track.keyframes[i + 1],
              }
            } else {
              return {
                next: k,
                prev: i > 0 ? track.keyframes[i - 1] : undefined,
              }
            }
          },
          [sequenceTrcackId],
        )

        let shade: Shade

        if (common.beingScrubbed) {
          shade = 'Sequenced_OnKeyframe_BeingScrubbed'
        } else {
          if (nearbyKeyframes.cur) {
            shade = 'Sequenced_OnKeyframe'
          } else if (nearbyKeyframes.prev?.connectedRight === true) {
            shade = 'Sequenced_BeingInterpolated'
          } else {
            shade = 'Sequened_NotBeingInterpolated'
          }
        }

        const nextPrevKeyframeCursors = (
          <NextPrevKeyframeCursors
            {...nearbyKeyframes}
            jumpToPosition={(position) => {
              obj.sheet.getSequence().position = position
            }}
            toggleKeyframeOnCurrentPosition={() => {
              if (nearbyKeyframes.cur) {
                getStudio()!.transaction((api) => {
                  api.unset(pointerToProp)
                })
              } else {
                getStudio()!.transaction((api) => {
                  api.set(pointerToProp, common.value)
                })
              }
            }}
          />
        )

        const ret: Sequenced<T> = {
          ...common,
          type: 'Sequenced',
          shade,
          nearbyKeyframes,
          controlIndicators: nextPrevKeyframeCursors,
        }

        return ret
      }
    }

    contextMenuItems.push({
      label: 'Reset to default',
      callback: () => {
        getStudio()!.transaction(({unset}) => {
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
            )
          })
        },
      })
    }

    const statics = val(obj.template.getStaticValues())

    if (typeof getDeep(statics, pathToProp) !== 'undefined') {
      const ret: Static<T> = {
        ...common,
        type: 'Static',
        shade: common.beingScrubbed ? 'Static_BeingScrubbed' : 'Static',
        controlIndicators: (
          <DefaultOrStaticValueIndicator hasStaticOverride={true} />
        ),
      }
      return ret
    }

    const ret: Default<T> = {
      ...common,
      type: 'Default',
      shade: 'Default',
      controlIndicators: (
        <DefaultOrStaticValueIndicator hasStaticOverride={false} />
      ),
    }

    return ret
  }, [])
}

type NearbyKeyframes = {
  prev?: Keyframe<unknown>
  cur?: Keyframe<unknown>
  next?: Keyframe<unknown>
}

export const shadeToColor: {[K in Shade]: string} = {
  Default: '#222',
  Static: '#333',
  Static_BeingScrubbed: '#91a100',
  Sequenced_OnKeyframe: '#700202',
  Sequenced_OnKeyframe_BeingScrubbed: '#c50000',
  Sequenced_BeingInterpolated: '#0387a8',
  Sequened_NotBeingInterpolated: '#004c5f',
}

type Shade =
  | 'Default'
  | 'Static'
  | 'Static_BeingScrubbed'
  | 'Sequenced_OnKeyframe'
  | 'Sequenced_OnKeyframe_BeingScrubbed'
  | 'Sequenced_BeingInterpolated'
  | 'Sequened_NotBeingInterpolated'

function isPropConfSequencable(conf: PropTypeConfig): boolean {
  return conf.type === 'number' || (!!conf.sanitizer && !!conf.interpolator)
}
