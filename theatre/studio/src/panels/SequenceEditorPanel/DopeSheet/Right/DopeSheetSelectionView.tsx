import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useKeyDown from '@theatre/studio/uiComponents/useKeyDown'
import useValToAtom from '@theatre/studio/uiComponents/useValToAtom'
import mutableSetDeep from '@theatre/shared/utils/mutableSetDeep'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_AllRowTypes,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import type {ILogger, IUtilLogger} from '@theatre/shared/logger'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'

const Container = styled.div<{isShiftDown: boolean}>`
  cursor: ${(props) => (props.isShiftDown ? 'cell' : 'default')};
`

const DopeSheetSelectionView: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP, children}) => {
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )
  const isShiftDown = useKeyDown('Shift')
  const selectionBounds = useCaptureSelection(layoutP, containerNode)
  const selectionBoundsRef = useRef<typeof selectionBounds>(selectionBounds)
  selectionBoundsRef.current = selectionBounds

  return (
    <Container ref={containerRef} isShiftDown={isShiftDown}>
      {selectionBounds && (
        <SelectionRectangle state={selectionBounds} layoutP={layoutP} />
      )}
      {children}
    </Container>
  )
}

type SelectionBounds = {
  positions: [from: number, to: number]
  ys: [from: number, to: number]
}

function useCaptureSelection(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  containerNode: HTMLDivElement | null,
) {
  const [ref, state] = useRefAndState<SelectionBounds | null>(null)

  const logger = useLogger('useCaptureSelection')
  useDrag(
    containerNode,
    useMemo((): Parameters<typeof useDrag>[1] => {
      return {
        debugName: 'DopeSheetSelectionView/useCaptureSelection',
        dontBlockMouseDown: true,
        lockCSSCursorTo: 'cell',
        onDragStart(event) {
          if (!event.shiftKey || event.target instanceof HTMLInputElement) {
            return false
          }
          const rect = containerNode!.getBoundingClientRect()

          const posInScaledSpace = event.clientX - rect.left

          const posInUnitSpace = val(layoutP.scaledSpace.toUnitSpace)(
            posInScaledSpace,
          )

          ref.current = {
            positions: [posInUnitSpace, posInUnitSpace],
            ys: [event.clientY - rect.top, event.clientY - rect.top],
          }

          val(layoutP.selectionAtom).setState({current: undefined})

          return {
            onDrag(_dx, _dy, event) {
              // const state = ref.current!
              const rect = containerNode!.getBoundingClientRect()

              const posInScaledSpace = event.clientX - rect.left

              const posInUnitSpace = val(layoutP.scaledSpace.toUnitSpace)(
                posInScaledSpace,
              )

              ref.current = {
                positions: [ref.current!.positions[0], posInUnitSpace],
                ys: [ref.current!.ys[0], event.clientY - rect.top],
              }

              const selection = utils.boundsToSelection(
                logger,
                layoutP,
                ref.current,
              )
              val(layoutP.selectionAtom).setState({current: selection})
            },
            onDragEnd(_dragHappened) {
              ref.current = null
            },
          }
        },
      }
    }, [layoutP, containerNode, ref]),
  )

  return state
}

namespace utils {
  const collectForAggregatedChildren = (
    logger: IUtilLogger,
    layoutP: Pointer<SequenceEditorPanelLayout>,
    leaf: SequenceEditorTree_SheetObject | SequenceEditorTree_PropWithChildren,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) => {
    const sheetObject = leaf.sheetObject
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(logger, leaf)

    const bottom = leaf.top + leaf.nodeHeight
    if (bottom > bounds.ys[0]) {
      for (const [position, keyframes] of aggregatedKeyframes.byPosition) {
        if (position <= bounds.positions[0]) continue
        if (position >= bounds.positions[1]) break

        // yes selected

        for (const keyframeWithTrack of keyframes) {
          mutableSetDeep(
            selectionByObjectKey,
            (selectionByObjectKeyP) =>
              // convenience for accessing a deep path which might not actually exist
              // through the use of pointer proxy (so we don't have to deal with undeifned )
              selectionByObjectKeyP[sheetObject.address.objectKey].byTrackId[
                keyframeWithTrack.track.id
              ].byKeyframeId[keyframeWithTrack.kf.id],
            true,
          )
        }
      }
    }

    collectChildren(logger, layoutP, leaf, bounds, selectionByObjectKey)
  }

  const collectorByLeafType: {
    [K in SequenceEditorTree_AllRowTypes['type']]?: (
      logger: IUtilLogger,
      layoutP: Pointer<SequenceEditorPanelLayout>,
      leaf: Extract<SequenceEditorTree_AllRowTypes, {type: K}>,
      bounds: SelectionBounds,
      selectionByObjectKey: DopeSheetSelection['byObjectKey'],
    ) => void
  } = {
    propWithChildren(logger, layoutP, leaf, bounds, selectionByObjectKey) {
      collectForAggregatedChildren(
        logger,
        layoutP,
        leaf,
        bounds,
        selectionByObjectKey,
      )
    },
    sheetObject(logger, layoutP, leaf, bounds, selectionByObjectKey) {
      collectForAggregatedChildren(
        logger,
        layoutP,
        leaf,
        bounds,
        selectionByObjectKey,
      )
    },
    primitiveProp(logger, layoutP, leaf, bounds, selectionByObjectKey) {
      const {sheetObject, trackId} = leaf
      const trackData = val(
        getStudio().atomP.historic.coreByProject[sheetObject.address.projectId]
          .sheetsById[sheetObject.address.sheetId].sequence.tracksByObject[
          sheetObject.address.objectKey
        ].trackData[trackId],
      )!

      for (const kf of trackData.keyframes) {
        if (kf.position <= bounds.positions[0]) continue
        if (kf.position >= bounds.positions[1]) break

        mutableSetDeep(
          selectionByObjectKey,
          (selectionByObjectKeyP) =>
            // convenience for accessing a deep path which might not actually exist
            // through the use of pointer proxy (so we don't have to deal with undeifned )
            selectionByObjectKeyP[sheetObject.address.objectKey].byTrackId[
              trackId
            ].byKeyframeId[kf.id],
          true,
        )
      }
    },
  }

  const collectChildren = (
    logger: IUtilLogger,
    layoutP: Pointer<SequenceEditorPanelLayout>,
    leaf: SequenceEditorTree_AllRowTypes,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) => {
    if ('children' in leaf) {
      for (const sub of leaf.children) {
        collectFromAnyLeaf(logger, layoutP, sub, bounds, selectionByObjectKey)
      }
    }
  }

  function collectFromAnyLeaf(
    logger: IUtilLogger,
    layoutP: Pointer<SequenceEditorPanelLayout>,
    leaf: SequenceEditorTree_AllRowTypes,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) {
    // don't collect from non rendered
    if (!leaf.shouldRender) return

    if (
      bounds.ys[0] > leaf.top + leaf.heightIncludingChildren ||
      leaf.top > bounds.ys[1]
    ) {
      return
    }
    const collector = collectorByLeafType[leaf.type]
    if (collector) {
      collector(
        logger,
        layoutP,
        leaf as $IntentionalAny,
        bounds,
        selectionByObjectKey,
      )
    } else {
      collectChildren(logger, layoutP, leaf, bounds, selectionByObjectKey)
    }
  }

  export function boundsToSelection(
    logger: ILogger,
    layoutP: Pointer<SequenceEditorPanelLayout>,
    bounds: SelectionBounds,
  ): DopeSheetSelection {
    const selectionByObjectKey: DopeSheetSelection['byObjectKey'] = {}
    bounds = sortBounds(bounds)

    const tree = val(layoutP.tree)
    collectFromAnyLeaf(
      logger.utilFor.internal(),
      layoutP,
      tree,
      bounds,
      selectionByObjectKey,
    )

    const sheet = val(layoutP.tree.sheet)
    return {
      type: 'DopeSheetSelection',
      byObjectKey: selectionByObjectKey,
      getDragHandlers(origin) {
        return {
          debugName: 'DopeSheetSelectionView/boundsToSelection',
          onDragStart() {
            let tempTransaction: CommitOrDiscard | undefined

            const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)

            return {
              onDrag(dx, _, event) {
                if (tempTransaction) {
                  tempTransaction.discard()
                  tempTransaction = undefined
                }

                const snapPos = DopeSnap.checkIfMouseEventSnapToPos(event, {
                  ignore: origin.domNode,
                })

                const delta =
                  snapPos != null
                    ? snapPos - origin.positionAtStartOfDrag
                    : toUnitSpace(dx)

                tempTransaction = getStudio().tempTransaction(
                  ({stateEditors}) => {
                    const transformKeyframes =
                      stateEditors.coreByProject.historic.sheetsById.sequence
                        .transformKeyframes

                    for (const objectKey of Object.keys(selectionByObjectKey)) {
                      const {byTrackId} = selectionByObjectKey[objectKey]!
                      for (const trackId of Object.keys(byTrackId)) {
                        const {byKeyframeId} = byTrackId[trackId]!
                        transformKeyframes({
                          trackId,
                          keyframeIds: Object.keys(byKeyframeId),
                          translate: delta,
                          scale: 1,
                          origin: 0,
                          snappingFunction:
                            sheet.getSequence().closestGridPosition,
                          objectKey,
                          projectId: origin.projectId,
                          sheetId: origin.sheetId,
                        })
                      }
                    }
                  },
                )
              },
              onDragEnd(dragHappened) {
                if (dragHappened) tempTransaction?.commit()
                else tempTransaction?.discard()
              },
            }
          },
        }
      },
      delete() {
        getStudio().transaction(({stateEditors}) => {
          const deleteKeyframes =
            stateEditors.coreByProject.historic.sheetsById.sequence
              .deleteKeyframes

          for (const objectKey of Object.keys(selectionByObjectKey)) {
            const {byTrackId} = selectionByObjectKey[objectKey]!
            for (const trackId of Object.keys(byTrackId)) {
              const {byKeyframeId} = byTrackId[trackId]!
              deleteKeyframes({
                ...sheet.address,
                objectKey,
                trackId,
                keyframeIds: Object.keys(byKeyframeId),
              })
            }
          }
        })
      },
    }
  }
}

const SelectionRectangleDiv = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.4);
  box-size: border-box;
`

const sortBounds = (b: SelectionBounds): SelectionBounds => {
  return {
    positions: [...b.positions].sort(
      (a, b) => a - b,
    ) as SelectionBounds['positions'],
    ys: [...b.ys].sort((a, b) => a - b) as SelectionBounds['ys'],
  }
}

const SelectionRectangle: React.VFC<{
  state: SelectionBounds
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({state, layoutP}) => {
  const atom = useValToAtom(state)

  return usePrism(() => {
    const state = val(atom.pointer)
    const sorted = sortBounds(state)

    const unitSpaceToScaledSpace = val(layoutP.scaledSpace.fromUnitSpace)

    const positionsInScaledSpace = sorted.positions.map(unitSpaceToScaledSpace)

    const top = sorted.ys[0]
    const height = sorted.ys[1] - sorted.ys[0]

    const left = positionsInScaledSpace[0]
    const width = positionsInScaledSpace[1] - positionsInScaledSpace[0]

    return (
      <SelectionRectangleDiv
        style={{
          top: top + 'px',
          height: height + 'px',
          left: left + 'px',
          width: width + 'px',
        }}
      ></SelectionRectangleDiv>
    )
  }, [layoutP, atom])
}

export default DopeSheetSelectionView
