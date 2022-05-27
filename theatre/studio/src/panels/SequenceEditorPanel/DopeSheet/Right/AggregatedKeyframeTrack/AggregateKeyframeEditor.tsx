import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {AggregateKeyframePositionIsSelected} from './AggregatedKeyframeTrack'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import getStudio from '@theatre/studio/getStudio'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import type {ILogger} from '@theatre/shared/logger'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import useRefAndState from '@theatre/studio/utils/useRefAndState'

const AggregateKeyframeEditorContainer = styled.div`
  position: absolute;
`

const noConnector = <></>

export type IAggregateKeyframesAtPosition = {
  position: number
  /** all tracks have a keyframe for this position (otherwise, false means 'partial') */
  allHere: boolean
  selected: AggregateKeyframePositionIsSelected | undefined
  keyframes: {
    kf: Keyframe
    track: {
      id: SequenceTrackId
      data: TrackData
    }
  }[]
}

export type IAggregateKeyframeEditorProps = {
  index: number
  aggregateKeyframes: IAggregateKeyframesAtPosition[]
  layoutP: Pointer<SequenceEditorPanelLayout>
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject
  selection: undefined | DopeSheetSelection
}

const AggregateKeyframeEditor: React.VFC<IAggregateKeyframeEditorProps> = (
  props,
) => {
  const {index, aggregateKeyframes} = props
  const cur = aggregateKeyframes[index]
  const next = aggregateKeyframes[index + 1]
  const connected =
    next && cur.keyframes.length === next.keyframes.length
      ? // all keyframes are same in the next position
        cur.keyframes.every(
          ({track}, ind) => next.keyframes[ind].track === track,
        ) && {
          length: next.position - cur.position,
          selected:
            cur.selected === AggregateKeyframePositionIsSelected.AllSelected &&
            next.selected === AggregateKeyframePositionIsSelected.AllSelected,
        }
      : null

  return (
    <AggregateKeyframeEditorContainer
      style={{
        top: `${props.viewModel.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          cur.position
        }px))`,
      }}
    >
      <AggregateKeyframeDot
        keyframes={cur.keyframes}
        position={cur.position}
        theme={{
          isSelected: cur.selected,
        }}
        isAllHere={cur.allHere}
        {...props}
      />
      {connected ? (
        <ConnectorLine
          connectorLengthInUnitSpace={connected.length}
          isPopoverOpen={false}
          // if all keyframe aggregates are selected
          isSelected={connected.selected}
        />
      ) : (
        noConnector
      )}
    </AggregateKeyframeEditorContainer>
  )
}

const DOT_SIZE_PX = 16
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

/** The keyframe diamond ◆ */
const DotContainer = styled.div`
  position: absolute;
  ${absoluteDims(DOT_SIZE_PX)}
  z-index: 1;
`

const HitZone = styled.div`
  z-index: 2;
  cursor: ew-resize;

  ${DopeSnapHitZoneUI.CSS}

  #pointer-root.draggingPositionInSequenceEditor & {
    ${DopeSnapHitZoneUI.CSS_WHEN_SOMETHING_DRAGGING}
  }

  &:hover + ${DotContainer},
  #pointer-root.draggingPositionInSequenceEditor &:hover + ${DotContainer},
  // notice "," css "or"
  &.${DopeSnapHitZoneUI.BEING_DRAGGED_CLASS} + ${DotContainer} {
    ${absoluteDims(DOT_HOVER_SIZE_PX)}
  }
`

function useDragForAggregateKeyframeDot(
  node: HTMLDivElement | null,
  props: IAggregateKeyframeDotProps,
  options: {
    /**
     * hmm: this is a hack so we can actually receive the
     * {@link MouseEvent} from the drag event handler and use
     * it for positioning the popup.
     */
    onClickFromDrag(dragStartEvent: MouseEvent): void
  },
): [isDragging: boolean] {
  const propsRef = useRef(props)
  propsRef.current = props

  const useDragOpts = useMemo<UseDragOpts>(() => {
    return {
      debugName: 'AggregateKeyframeDot/useDragKeyframe',
      onDragStart(event) {
        const props = propsRef.current
        if (props.selection) {
          const {selection, viewModel} = props
          const {sheetObject} = viewModel
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag: props.keyframes[0].kf.position,
            })
            .onDragStart(event)
        }

        const {keyframes} = props

        const propsAtStartOfDrag = props
        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )

        let tempTransaction: CommitOrDiscard | undefined

        return {
          onDrag(dx, dy, event) {
            const newPosition = Math.max(
              // check if our event hoversover a [data-pos] element
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: node,
              }) ??
                // if we don't find snapping target, check the distance dragged + original position
                keyframes[0].kf.position + toUnitSpace(dx),
              // sanitize to minimum of zero
              0,
            )

            tempTransaction?.discard()
            tempTransaction = undefined
            tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
              for (const keyframe of keyframes) {
                const original = keyframe.kf
                stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
                  {
                    ...propsAtStartOfDrag.viewModel.sheetObject.address,
                    trackId: keyframe.track.id,
                    keyframes: [{...original, position: newPosition}],
                    snappingFunction: val(
                      propsAtStartOfDrag.layoutP.sheet,
                    ).getSequence().closestGridPosition,
                  },
                )
              }
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) {
              tempTransaction?.commit()
            } else {
              tempTransaction?.discard()
              options.onClickFromDrag(event)
            }
          },
        }
      },
    }
  }, [])

  const [isDragging] = useDrag(node, useDragOpts)

  useLockFrameStampPosition(isDragging, props.keyframes[0].kf.position)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}

type IAggregateKeyframeDotProps = {
  theme: IDotThemeValues
  isAllHere: boolean
  position: number
  keyframes: KeyframeWithTrack[]
} & IAggregateKeyframeEditorProps

const AggregateKeyframeDot: React.FC<IAggregateKeyframeDotProps> = (props) => {
  const logger = useLogger('AggregateKeyframeDot')
  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)
  const [contextMenu] = useAggregateKeyframeContextMenu(node, logger, props)

  const [isDragging] = useDragForAggregateKeyframeDot(node, props, {
    onClickFromDrag(dragStartEvent) {
      // TODO Aggregate inline keyframe editor
      // openEditor(dragStartEvent, ref.current!)
    },
  })

  return (
    <>
      <HitZone
        data-hitzone
        ref={ref}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: false,
          position: props.position,
        })}
      />
      <DotContainer>
        {props.isAllHere ? (
          <AggregateDotAllHereSvg {...props.theme} />
        ) : (
          <AggregateDotSomeHereSvg {...props.theme} />
        )}
      </DotContainer>
      {contextMenu}
    </>
  )
}

type IDotThemeValues = {
  isSelected: AggregateKeyframePositionIsSelected | undefined
}

const SELECTED_COLOR = '#b8e4e2'
const DEFAULT_PRIMARY_COLOR = '#40AAA4'
const DEFAULT_SECONDARY_COLOR = '#45747C'
const selectionColorAll = (theme: IDotThemeValues) =>
  theme.isSelected === AggregateKeyframePositionIsSelected.AllSelected
    ? SELECTED_COLOR
    : theme.isSelected ===
      AggregateKeyframePositionIsSelected.AtLeastOneUnselected
    ? DEFAULT_PRIMARY_COLOR
    : DEFAULT_SECONDARY_COLOR
const selectionColorSome = (theme: IDotThemeValues) =>
  theme.isSelected === AggregateKeyframePositionIsSelected.AllSelected
    ? SELECTED_COLOR
    : theme.isSelected ===
      AggregateKeyframePositionIsSelected.AtLeastOneUnselected
    ? DEFAULT_PRIMARY_COLOR
    : DEFAULT_SECONDARY_COLOR

const AggregateDotAllHereSvg = (theme: IDotThemeValues) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4.46443"
      y="10.0078"
      width="5"
      height="5"
      transform="rotate(-45 4.46443 10.0078)"
      fill="#212327" // background knockout fill
      stroke={selectionColorSome(theme)}
    />
    <rect
      x="3.75732"
      y="6.01953"
      width="6"
      height="6"
      transform="rotate(-45 3.75732 6.01953)"
      fill={selectionColorAll(theme)}
    />
  </svg>
)

// when the aggregate keyframes are sparse across tracks at this position
const AggregateDotSomeHereSvg = (theme: IDotThemeValues) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4.46443"
      y="8"
      width="5"
      height="5"
      transform="rotate(-45 4.46443 8)"
      fill="#23262B"
      stroke={selectionColorAll(theme)}
    />
  </svg>
)

function useAggregateKeyframeContextMenu(
  target: HTMLDivElement | null,
  logger: ILogger,
  props: IAggregateKeyframeDotProps,
) {
  // TODO: missing features: delete, copy + paste
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      return []
    },
    onOpen() {
      logger._debug('Show keyframe', props)
    },
  })
}

export default AggregateKeyframeEditor
