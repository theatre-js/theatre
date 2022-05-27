import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {val} from '@theatre/dataverse'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import type {ILogger} from '@theatre/shared/logger'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import getStudio from '@theatre/studio/getStudio'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'

export const DOT_SIZE_PX = 16
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

        const {keyframes} = props

        if (
          props.selection &&
          props.aggregateKeyframes[props.index].selected ===
            AggregateKeyframePositionIsSelected.AllSelected
        ) {
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
export const AggregateKeyframeDot: React.FC<IAggregateKeyframeDotProps> = (
  props,
) => {
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
        ref={ref}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging,
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
