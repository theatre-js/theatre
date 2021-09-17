import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {lighten} from 'polished'
import React from 'react'
import {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {
  SequenceEditorPanelLayout,
  DopeSheetSelection,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {dotSize} from './Dot'
import type KeyframeEditor from './KeyframeEditor'
import type Sequence from '@theatre/core/sequences/Sequence'

const connectorHeight = dotSize / 2 + 1
const connectorWidthUnscaled = 1000

export const connectorTheme = {
  normalColor: `#365b59`,
  get hoverColor() {
    return lighten(0.1, connectorTheme.normalColor)
  },
  get selectedColor() {
    return lighten(0.2, connectorTheme.normalColor)
  },
  get selectedHoverColor() {
    return lighten(0.4, connectorTheme.normalColor)
  },
}

const Container = styled.div<{isSelected: boolean}>`
  position: absolute;
  background: ${(props) =>
    props.isSelected
      ? connectorTheme.selectedColor
      : connectorTheme.normalColor};
  height: ${connectorHeight}px;
  width: ${connectorWidthUnscaled}px;

  left: 0;
  top: -${connectorHeight / 2}px;
  transform-origin: top left;
  z-index: 0;
  cursor: ew-resize;

  &:hover {
    background: ${(props) =>
      props.isSelected
        ? connectorTheme.selectedHoverColor
        : connectorTheme.hoverColor};
  }
`
type IProps = Parameters<typeof KeyframeEditor>[0]

const Connector: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const connectorLengthInUnitSpace = next.position - cur.position

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useContextMenu(node, {
    items: () => {
      return [
        {
          label: props.selection ? 'Delete Selection' : 'Delete both Keyframes',
          callback: () => {
            if (props.selection) {
              props.selection.delete()
            } else {
              getStudio()!.transaction(({stateEditors}) => {
                stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                  {
                    ...props.leaf.sheetObject.address,
                    keyframeIds: [cur.id, next.id],
                    trackId: props.leaf.trackId,
                  },
                )
              })
            }
          },
        },
      ]
    },
  })

  useDragKeyframe(node, props)

  return (
    <Container
      isSelected={!!props.selection}
      ref={nodeRef}
      onClick={(event) => {
        if (event.button !== 0) return

        // @todo Put this in the context menu

        const orig = JSON.stringify([
          cur.handles[2],
          cur.handles[3],
          next.handles[0],
          next.handles[1],
        ])
        const modifiedS = orig // window.prompt('As cubic-bezier()', orig)
        if (modifiedS && modifiedS !== orig) {
          return
          // const modified = JSON.parse(modifiedS)
          // getStudio()!.transaction(({stateEditors}) => {
          //   const {replaceKeyframes} =
          //     stateEditors.coreByProject.historic.sheetsById.sequence

          //   replaceKeyframes({
          //     ...props.leaf.sheetObject.address,
          //     snappingFunction: val(props.layoutP.sheet).getSequence()
          //       .closestGridPosition,
          //     trackId: props.leaf.trackId,
          //     keyframes: [
          //       {
          //         ...cur,
          //         handles: [
          //           cur.handles[0],
          //           cur.handles[1],
          //           modified[0],
          //           modified[1],
          //         ],
          //       },
          //       {
          //         ...next,
          //         handles: [
          //           modified[2],
          //           modified[3],
          //           next.handles[2],
          //           next.handles[3],
          //         ],
          //       },
          //     ],
          //   })
          // })
        }
      }}
      style={{
        transform: `scale3d(calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          connectorLengthInUnitSpace / connectorWidthUnscaled
        }), 1, 1)`,
      }}
    >
      {contextMenu}
    </Container>
  )
}

export default Connector

function useDragKeyframe(node: HTMLDivElement | null, props: IProps) {
  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps
    let selectionDragHandlers:
      | ReturnType<DopeSheetSelection['getDragHandlers']>
      | undefined
    let sequence: Sequence
    return {
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        if (propsRef.current.selection) {
          const {selection, leaf} = propsRef.current
          const {sheetObject} = leaf
          selectionDragHandlers = selection.getDragHandlers({
            ...sheetObject.address,
            pathToProp: leaf.pathToProp,
            trackId: leaf.trackId,
            keyframeId: propsRef.current.keyframe.id,
          })
          selectionDragHandlers.onDragStart?.(event)
          return
        }

        propsAtStartOfDrag = propsRef.current
        sequence = val(propsAtStartOfDrag.layoutP.sheet).getSequence()

        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, dy, event) {
        if (selectionDragHandlers) {
          selectionDragHandlers.onDrag(dx, dy, event)
          return
        }
        const delta = toUnitSpace(dx)
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.transformKeyframes(
            {
              ...propsAtStartOfDrag.leaf.sheetObject.address,
              trackId: propsAtStartOfDrag.leaf.trackId,
              keyframeIds: [
                propsAtStartOfDrag.keyframe.id,
                propsAtStartOfDrag.trackData.keyframes[
                  propsAtStartOfDrag.index + 1
                ].id,
              ],
              translate: delta,
              scale: 1,
              origin: 0,
              snappingFunction: sequence.closestGridPosition,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        if (selectionDragHandlers) {
          selectionDragHandlers.onDragEnd?.(dragHappened)

          selectionDragHandlers = undefined
        }
        if (dragHappened) {
          if (tempTransaction) {
            tempTransaction.commit()
          }
        } else {
          if (tempTransaction) {
            tempTransaction.discard()
          }
        }
        tempTransaction = undefined
      },
    }
  }, [])

  useDrag(node, gestureHandlers)
}
