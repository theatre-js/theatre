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
  const selectionBounds = useCaptureSelection(val(layoutP), containerNode)
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

/**
 * The horizontal and vertical bounds of the selection, each represented by a tuple in the form of [from, to].
 */
type SelectionBounds = {
  /**
   * The horizontal bounds of the selection as a tuple of "from" and "to" coordinates, "from" representing the start of the drag.
   */
  h: [from: number, to: number]
  /**
   * The vertical bounds of the selection as a tuple of "from" and "to" coordinates, "from" representing the start of the drag.
   */
  v: [from: number, to: number]
}

function useCaptureSelection(
  layout: SequenceEditorPanelLayout,
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

          const posInScaledSpace =
            event.clientX -
            rect.left -
            // selection is happening in left padded space, convert it to normal space
            layout.scaledSpace.leftPadding

          const posInUnitSpace =
            layout.scaledSpace.toUnitSpace(posInScaledSpace)

          ref.current = {
            h: [posInUnitSpace, posInUnitSpace],
            v: [event.clientY - rect.top, event.clientY - rect.top],
          }

          layout.selectionAtom.setState({current: undefined})

          return {
            onDrag(_dx, _dy, event) {
              // const state = ref.current!
              const rect = containerNode!.getBoundingClientRect()

              const posInScaledSpace =
                event.clientX -
                rect.left -
                // selection is happening in left padded space, convert it to normal space
                layout.scaledSpace.leftPadding

              const posInUnitSpace =
                layout.scaledSpace.toUnitSpace(posInScaledSpace)

              ref.current = {
                h: [ref.current!.h[0], posInUnitSpace],
                v: [ref.current!.v[0], event.clientY - rect.top],
              }

              const selection = utils.boundsToSelection(
                logger,
                layout,
                ref.current,
              )
              layout.selectionAtom.setState({current: selection})
            },
            onDragEnd(_dragHappened) {
              ref.current = null
            },
          }
        },
      }
    }, [layout, containerNode, ref]),
  )

  return state
}

namespace utils {
  const collectForAggregatedChildren = (
    logger: IUtilLogger,
    layout: SequenceEditorPanelLayout,
    leaf: SequenceEditorTree_SheetObject | SequenceEditorTree_PropWithChildren,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) => {
    const sheetObject = leaf.sheetObject
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(logger, leaf)

    const bottom = leaf.top + leaf.nodeHeight
    if (bottom > bounds.v[0]) {
      for (const [position, keyframes] of aggregatedKeyframes.byPosition) {
        if (position <= bounds.h[0]) continue
        if (position >= bounds.h[1]) break

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

    collectChildren(logger, layout, leaf, bounds, selectionByObjectKey)
  }

  const collectorByLeafType: {
    [K in SequenceEditorTree_AllRowTypes['type']]?: (
      logger: IUtilLogger,
      layout: SequenceEditorPanelLayout,
      leaf: Extract<SequenceEditorTree_AllRowTypes, {type: K}>,
      bounds: SelectionBounds,
      selectionByObjectKey: DopeSheetSelection['byObjectKey'],
    ) => void
  } = {
    propWithChildren(logger, layout, leaf, bounds, selectionByObjectKey) {
      collectForAggregatedChildren(
        logger,
        layout,
        leaf,
        bounds,
        selectionByObjectKey,
      )
    },
    sheetObject(logger, layout, leaf, bounds, selectionByObjectKey) {
      collectForAggregatedChildren(
        logger,
        layout,
        leaf,
        bounds,
        selectionByObjectKey,
      )
    },
    primitiveProp(logger, layout, leaf, bounds, selectionByObjectKey) {
      const {sheetObject, trackId} = leaf
      const trackData = val(
        getStudio().atomP.historic.coreByProject[sheetObject.address.projectId]
          .sheetsById[sheetObject.address.sheetId].sequence.tracksByObject[
          sheetObject.address.objectKey
        ].trackData[trackId],
      )!

      for (const kf of trackData.keyframes) {
        if (kf.position <= bounds.h[0]) continue
        if (kf.position >= bounds.h[1]) break

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
    layout: SequenceEditorPanelLayout,
    leaf: SequenceEditorTree_AllRowTypes,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) => {
    if ('children' in leaf) {
      for (const sub of leaf.children) {
        collectFromAnyLeaf(logger, layout, sub, bounds, selectionByObjectKey)
      }
    }
  }

  function collectFromAnyLeaf(
    logger: IUtilLogger,
    layout: SequenceEditorPanelLayout,
    leaf: SequenceEditorTree_AllRowTypes,
    bounds: SelectionBounds,
    selectionByObjectKey: DopeSheetSelection['byObjectKey'],
  ) {
    // don't collect from non rendered
    if (!leaf.shouldRender) return

    if (
      bounds.v[0] > leaf.top + leaf.heightIncludingChildren ||
      leaf.top > bounds.v[1]
    ) {
      return
    }
    const collector = collectorByLeafType[leaf.type]
    if (collector) {
      collector(
        logger,
        layout,
        leaf as $IntentionalAny,
        bounds,
        selectionByObjectKey,
      )
    } else {
      collectChildren(logger, layout, leaf, bounds, selectionByObjectKey)
    }
  }

  export function boundsToSelection(
    logger: ILogger,
    layout: SequenceEditorPanelLayout,
    bounds: SelectionBounds,
  ): DopeSheetSelection {
    const selectionByObjectKey: DopeSheetSelection['byObjectKey'] = {}
    bounds = sortBounds(bounds)

    const tree = layout.tree
    collectFromAnyLeaf(
      logger.utilFor.internal(),
      layout,
      tree,
      bounds,
      selectionByObjectKey,
    )

    const sheet = layout.tree.sheet
    return {
      type: 'DopeSheetSelection',
      byObjectKey: selectionByObjectKey,
      getDragHandlers(origin) {
        return {
          debugName: 'DopeSheetSelectionView/boundsToSelection',
          onDragStart() {
            let tempTransaction: CommitOrDiscard | undefined

            const toUnitSpace = layout.scaledSpace.toUnitSpace

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
    h: [...b.h].sort((a, b) => a - b) as SelectionBounds['h'],
    v: [...b.v].sort((a, b) => a - b) as SelectionBounds['v'],
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
    const leftPadding = val(layoutP.scaledSpace.leftPadding)

    const positionsInScaledSpace = sorted.h
      .map(unitSpaceToScaledSpace)
      // bounds are in normal space, convert them left-padded space
      .map((coord) => coord + leftPadding)

    const top = sorted.v[0]
    const height = sorted.v[1] - sorted.v[0]

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
