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
import {DOT_SIZE_PX} from './KeyframeDot'
import type KeyframeEditor from './KeyframeEditor'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import CurveEditorPopover from './CurveEditorPopover/CurveEditorPopover'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import type {OpenFn} from '@theatre/studio/src/uiComponents/Popover/usePopover'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'
import {COLOR_POPOVER_BACK} from './CurveEditorPopover/colors'

const CONNECTOR_HEIGHT = DOT_SIZE_PX / 2 + 1
const CONNECTOR_WIDTH_UNSCALED = 1000

const POPOVER_MARGIN = 5

type IConnectorThemeValues = {
  isPopoverOpen: boolean
  isSelected: boolean
}

export const CONNECTOR_THEME = {
  normalColor: `#365b59`, // (greenish-blueish)ish
  popoverOpenColor: `#817720`, // orangey yellowish
  barColor: (values: IConnectorThemeValues) => {
    const base = values.isPopoverOpen
      ? CONNECTOR_THEME.popoverOpenColor
      : CONNECTOR_THEME.normalColor
    return values.isSelected ? lighten(0.2, base) : base
  },
  hoverColor: (values: IConnectorThemeValues) => {
    const base = values.isPopoverOpen
      ? CONNECTOR_THEME.popoverOpenColor
      : CONNECTOR_THEME.normalColor
    return values.isSelected ? lighten(0.4, base) : lighten(0.1, base)
  },
}

const Container = styled.div<IConnectorThemeValues>`
  position: absolute;
  background: ${CONNECTOR_THEME.barColor};
  height: ${CONNECTOR_HEIGHT}px;
  width: ${CONNECTOR_WIDTH_UNSCALED}px;

  left: 0;
  top: -${CONNECTOR_HEIGHT / 2}px;
  transform-origin: top left;
  z-index: 0;
  cursor: ew-resize;

  &:after {
    display: block;
    position: absolute;
    content: ' ';
    top: -4px;
    bottom: -4px;
    left: 0;
    right: 0;
  }

  &:hover {
    background: ${CONNECTOR_THEME.hoverColor};
  }
`

const EasingPopover = styled(BasicPopover)`
  --popover-outer-stroke: transparent;
  --popover-inner-stroke: ${COLOR_POPOVER_BACK};
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const Connector: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const {isPointerBeingCaptured} = usePointerCapturing(
    'KeyframeEditor Connector',
  )

  const rightDims = val(props.layoutP.rightDims)
  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    {
      debugName: 'Connector',
      closeWhenPointerIsDistant: !isPointerBeingCaptured(),
      constraints: {
        minX: rightDims.screenX + POPOVER_MARGIN,
        maxX: rightDims.screenX + rightDims.width - POPOVER_MARGIN,
      },
    },
    () => {
      return (
        <EasingPopover showPopoverEdgeTriangle={false}>
          <CurveEditorPopover {...props} onRequestClose={closePopover} />
        </EasingPopover>
      )
    },
  )

  const [contextMenu] = useConnectorContextMenu(
    props,
    node,
    cur,
    next,
    openPopover,
  )
  useDragKeyframe(node, props)

  const connectorLengthInUnitSpace = next.position - cur.position

  const themeValues: IConnectorThemeValues = {
    isPopoverOpen,
    isSelected: !!props.selection,
  }

  return (
    <Container
      {...themeValues}
      ref={nodeRef}
      style={{
        // Previously we used scale3d, which had weird fuzzy rendering look in both FF & Chrome
        transform: `scaleX(calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          connectorLengthInUnitSpace / CONNECTOR_WIDTH_UNSCALED
        }))`,
      }}
      onClick={(e) => {
        if (node) openPopover(e, node)
      }}
    >
      {popoverNode}
      {contextMenu}
    </Container>
  )
}

export default Connector

function useDragKeyframe(node: HTMLDivElement | null, props: IProps) {
  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    return {
      debugName: 'useDragKeyframe',
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        const props = propsRef.current
        let tempTransaction: CommitOrDiscard | undefined

        if (props.selection) {
          const {selection, leaf} = props
          const {sheetObject} = leaf
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              pathToProp: leaf.pathToProp,
              trackId: leaf.trackId,
              keyframeId: props.keyframe.id,
              domNode: node!,
              positionAtStartOfDrag:
                props.trackData.keyframes[props.index].position,
            })
            .onDragStart(event)
        }

        const propsAtStartOfDrag = props
        const sequence = val(propsAtStartOfDrag.layoutP.sheet).getSequence()

        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )

        return {
          onDrag(dx, dy, event) {
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
            if (dragHappened) {
              if (tempTransaction) {
                tempTransaction.commit()
              }
            } else {
              if (tempTransaction) {
                tempTransaction.discard()
              }
            }
          },
        }
      },
    }
  }, [])

  useDrag(node, gestureHandlers)
}

function useConnectorContextMenu(
  props: IProps,
  node: HTMLDivElement | null,
  cur: Keyframe,
  next: Keyframe,
  openPopover: OpenFn,
) {
  const maybeKeyframeIds = selectedKeyframeIdsIfInSingleTrack(props.selection)
  return useContextMenu(node, {
    menuItems: () => {
      return [
        {
          label: maybeKeyframeIds ? 'Copy Selection' : 'Copy both Keyframes',
          callback: () => {
            if (maybeKeyframeIds) {
              const keyframes = maybeKeyframeIds.map(
                (keyframeId) =>
                  props.trackData.keyframes.find(
                    (keyframe) => keyframe.id === keyframeId,
                  )!,
              )

              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  keyframes,
                )
              })
            } else {
              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes([
                  cur,
                  next,
                ])
              })
            }
          },
        },
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
        {
          label: 'Open Easing Palette',
          callback: (e) => {
            openPopover(e, node!)
          },
        },
      ]
    },
  })
}
