import get from 'lodash-es/get'
import React, {useRef, useState} from 'react'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {getPointerParts, prism, val} from '@theatre/dataverse'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import getStudio from '@theatre/studio/getStudio'
import type Scrub from '@theatre/studio/Scrub'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getDeep from '@theatre/shared/utils/getDeep'
import {useDerivation} from '@theatre/react'
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
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import pointerDeep from '@theatre/shared/utils/pointerDeep'

interface EditingToolsCommon<T> {
  value: T
  beingScrubbed: boolean
  contextMenuItems: Array<IContextMenuItem>
  /** e.g. `< • >` or `<   >` for {@link EditingToolsSequenced} */
  controlIndicators: React.ReactElement

  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permanentlySetValue(v: T): void
}

interface EditingToolsDefault<T> extends EditingToolsCommon<T> {
  type: 'Default'
  shade: Shade
}

interface EditingToolsStatic<T> extends EditingToolsCommon<T> {
  type: 'Static'
  shade: Shade
}

interface EditingToolsSequenced<T> extends EditingToolsCommon<T> {
  type: 'Sequenced'
  shade: Shade
  /** based on the position of the playhead */
  nearbyKeyframes: NearbyKeyframes
}

type EditingTools<T> =
  | EditingToolsDefault<T>
  | EditingToolsStatic<T>
  | EditingToolsSequenced<T>

const cache = new WeakMap<{}, IDerivation<EditingTools<$IntentionalAny>>>()

/**
 * Note: we're able to get `obj` and `propConfig` from `pointerToProp`,
 * so the only reason they're still in the arguments list is that
 */
function createDerivation<T extends SerializablePrimitive>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_AllSimples,
): IDerivation<EditingTools<T>> {
  return prism(() => {
    const pathToProp = getPointerParts(pointerToProp).path

    const final = val(pointerToProp) as T

    const expression = val(
      pointerDeep(
        obj.template.project.pointers.historic.sheetsById[obj.address.sheetId]
          .expressionOverrides.byObject[obj.address.objectKey],
        pathToProp,
      ),
    )
    const parseExpressionTest =
      typeof expression === 'string'
        ? pointerDeep(obj.propsP, expression.split('+')?.[0]?.split('.'))
        : undefined

    const editPropValue = prism.memo(
      'editPropValue',
      () => {
        let currentScrub: Scrub | null = null

        return {
          temporarilySetValue(v: T): void {
            if (!currentScrub) {
              currentScrub = getStudio()!.scrub()
            }
            if (parseExpressionTest && typeof expression === 'string') {
              currentScrub.capture((api) => {
                api.set(
                  parseExpressionTest,
                  (v as number) - Number(expression.split('+')?.[1] ?? 0),
                )
              })
            } else {
              currentScrub.capture((api) => {
                api.set(pointerToProp, v)
              })
            }
          },
          discardTemporaryValue(): void {
            if (currentScrub) {
              currentScrub.discard()
              currentScrub = null
            }
          },
          permanentlySetValue(v: T): void {
            if (currentScrub) {
              if (parseExpressionTest && typeof expression === 'string') {
                currentScrub.capture((api) => {
                  api.set(
                    parseExpressionTest,
                    (v as number) - Number(expression.split('+')?.[1] ?? 0),
                  )
                })
              } else {
                currentScrub.capture((api) => {
                  api.set(pointerToProp, v)
                })
              }
              currentScrub.commit()
              currentScrub = null
            } else {
              if (parseExpressionTest && typeof expression === 'string') {
                getStudio()!.transaction((api) => {
                  api.set(
                    parseExpressionTest,
                    (v as number) - Number(expression.split('+')?.[1] ?? 0),
                  )
                })
              } else {
                getStudio()!.transaction((api) => {
                  api.set(pointerToProp, v)
                })
              }
            }
          },
        }
      },
      [],
    )

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

    const common: EditingToolsCommon<T> = {
      ...editPropValue,
      value: final,
      beingScrubbed,
      contextMenuItems,
      controlIndicators: <></>,
    }

    const isSequencable = isPropConfSequencable(propConfig)

    if (expression !== undefined) {
      contextMenuItems.push({
        label: 'Make not expression',
        callback: () => {
          getStudio()!.transaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.expressionOverrides.byObject.setExpressionOfPrimitiveProp(
              {
                ...obj.address,
                pathToProp,
                expression: undefined,
              },
            )
          })
        },
      })
    }

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
                  value: val(pointerToProp) as T,
                },
              )
            })
          },
        })

        const sequenceTrackId = possibleSequenceTrackId as SequenceTrackId
        const nearbyKeyframes = prism.sub(
          'lcr',
          (): NearbyKeyframes => {
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
            return getNearbyKeyframesOfTrack(
              obj,
              track && {
                data: track,
                id: sequenceTrackId,
                sheetObject: obj,
              },
              sequencePosition,
            )
          },
          [sequenceTrackId],
        )

        let shade: Shade

        if (common.beingScrubbed) {
          shade = 'Sequenced_OnKeyframe_BeingScrubbed'
        } else {
          if (nearbyKeyframes.cur) {
            shade = 'Sequenced_OnKeyframe'
          } else if (nearbyKeyframes.prev?.kf.connectedRight === true) {
            shade = 'Sequenced_BeingInterpolated'
          } else {
            shade = 'Sequened_NotBeingInterpolated'
          }
        }

        const toggle = () => {
          if (nearbyKeyframes.cur) {
            getStudio()!.transaction((api) => {
              api.unset(pointerToProp)
            })
          } else {
            getStudio()!.transaction((api) => {
              api.set(pointerToProp, common.value)
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

        const nextPrevKeyframeCursors =
          expression === undefined ? (
            <NextPrevKeyframeCursors {...controls} />
          ) : (
            <Popover obj={obj} pathToProp={pathToProp} />
          )

        const ret: EditingToolsSequenced<T> = {
          ...common,
          type: 'Sequenced',
          shade,
          nearbyKeyframes,
          controlIndicators: nextPrevKeyframeCursors,
        }

        return ret
      }
    }

    if (expression === undefined) {
      contextMenuItems.push({
        label: 'Reset to default',
        callback: () => {
          getStudio()!.transaction(({unset: unset}) => {
            unset(pointerToProp)
          })
        },
      })
    }

    if (isSequencable && expression === undefined) {
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
      contextMenuItems.push({
        label: 'Make expression',
        callback: () => {
          getStudio()!.transaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.expressionOverrides.byObject.setExpressionOfPrimitiveProp(
              {
                ...obj.address,
                pathToProp,
                expression: String(
                  val(pointerDeep(obj.template.defaultValues, pathToProp)),
                ),
              },
            )
          })
        },
      })
    }

    const statics = val(obj.template.staticValues)

    if (typeof getDeep(statics, pathToProp) !== 'undefined') {
      const ret: EditingToolsStatic<T> = {
        ...common,
        type: 'Static',
        shade: common.beingScrubbed ? 'Static_BeingScrubbed' : 'Static',
        controlIndicators:
          expression === undefined ? (
            <DefaultOrStaticValueIndicator hasStaticOverride={true} />
          ) : (
            <Popover obj={obj} pathToProp={pathToProp} />
          ),
      }
      return ret
    }

    const ret: EditingToolsDefault<T> = {
      ...common,
      type: 'Default',
      shade: 'Default',
      controlIndicators:
        expression === undefined ? (
          <DefaultOrStaticValueIndicator hasStaticOverride={true} />
        ) : (
          <Popover obj={obj} pathToProp={pathToProp} />
        ),
    }

    return ret
  })
}

function Popover(props: {obj: SheetObject; pathToProp: (string | number)[]}) {
  let refee = useRef<HTMLDivElement>(null!)

  const thing = val(
    props.obj.template.project.pointers.historic.sheetsById[
      props.obj.address.sheetId
    ].expressionOverrides.byObject[props.obj.address.objectKey],
  )

  const a = getDeep(thing ?? {}, props.pathToProp)

  const [temp, setTemp] = useState<CommitOrDiscard>()

  const popover = usePopover({}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      <div style={{fontFamily: 'monospace'}}>
        <BasicStringInput
          value={a as string}
          temporarilySetValue={(expression) =>
            setTemp(
              getStudio().tempTransaction(({stateEditors}) => {
                stateEditors.coreByProject.historic.sheetsById.expressionOverrides.byObject.setExpressionOfPrimitiveProp(
                  {
                    ...props.obj.address,
                    pathToProp: props.pathToProp,
                    expression,
                  },
                )
              }),
            )
          }
          discardTemporaryValue={() => {
            temp?.discard()
            setTemp(undefined)
          }}
          permanentlySetValue={(expression) =>
            getStudio().transaction(({stateEditors}) => {
              setTemp(undefined)
              stateEditors.coreByProject.historic.sheetsById.expressionOverrides.byObject.setExpressionOfPrimitiveProp(
                {
                  ...props.obj.address,
                  pathToProp: props.pathToProp,
                  expression,
                },
              )
            })
          }
          autoFocus={true}
        />
      </div>
    </BasicPopover>
  ))

  return (
    <div
      ref={refee}
      onClick={(e) => popover.open(e, refee.current)}
      style={{
        fontFamily: 'monospace',
        color: 'orange',
        width: '16px',
        margin: '0 0 0 2px',
        cursor: 'pointer',
        display: 'flex',
        flex: '0 0',
        justifyContent: 'center',
      }}
    >
      {a ? '𝑓' : ''}
      {popover.node}
    </div>
  )
}

function getDerivation<T extends SerializablePrimitive>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_AllSimples,
): IDerivation<EditingTools<T>> {
  if (cache.has(pointerToProp)) {
    return cache.get(pointerToProp)!
  } else {
    const d = createDerivation(pointerToProp, obj, propConfig)
    cache.set(pointerToProp, d)
    return d
  }
}

/**
 * Notably, this uses the {@link Scrub} API to support
 * indicating in the UI which pointers (values/props) are being
 * scrubbed. See how impl of {@link Scrub} manages
 * `state.flagsTransaction` to keep a list of these touched paths
 * for the UI to be able to recognize. (e.g. to highlight the
 * item in r3f as you change its scale).
 */
export function useEditingToolsForSimplePropInDetailsPanel<
  T extends SerializablePrimitive,
>(
  pointerToProp: Pointer<T>,
  obj: SheetObject,
  propConfig: PropTypeConfig_AllSimples,
): EditingTools<T> {
  const der = getDerivation(pointerToProp, obj, propConfig)
  return useDerivation(der)
}

type Shade =
  | 'Default'
  | 'Static'
  | 'Static_BeingScrubbed'
  | 'Sequenced_OnKeyframe'
  | 'Sequenced_OnKeyframe_BeingScrubbed'
  | 'Sequenced_BeingInterpolated'
  | 'Sequened_NotBeingInterpolated'
