import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {
  SequenceTrackId,
  StudioSheetItemKey,
} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {AggregateKeyframePositionIsSelected} from './AggregatedKeyframeTrack'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import CurveEditorPopover, {
  isConnectionEditingInCurvePopover,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/CurveEditorPopover/CurveEditorPopover'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {usePrism} from '@theatre/react'
import {selectedKeyframeConnections} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import usePresence, {
  FocusRelationship,
} from '@theatre/studio/uiComponents/usePresence'

const POPOVER_MARGIN_PX = 5

const AggregateKeyframeEditorContainer = styled.div`
  position: absolute;
`

const EasingPopoverWrapper = styled(BasicPopover)`
  --popover-outer-stroke: transparent;
  --popover-inner-stroke: rgba(26, 28, 30, 0.97);
`

const noConnector = <></>

export type IAggregateKeyframesAtPosition = {
  position: number
  /** all tracks have a keyframe for this position (otherwise, false means 'partial') */
  allHere: boolean
  selected: AggregateKeyframePositionIsSelected | undefined
  keyframes: KeyframeWithTrack[]
}

type AggregatedKeyframeConnection = SheetObjectAddress & {
  trackId: SequenceTrackId
  left: Keyframe
  right: Keyframe
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

/**
 * TODO we're spending a lot of cycles on each render of each aggreagte keyframes.
 *
 * Each keyframe node is doing O(N) operations, N being the number of underlying
 * keyframes it represetns.
 *
 * The biggest example is the `isConnectionEditingInCurvePopover()` call which is run
 * for every underlying keyframe, every time this component is rendered.
 *
 * We can optimize this away by doing all of this work _once_ when a curve editor popover
 * is open. This would require having some kind of stable identity for each aggregate row.
 * Let's defer that work until other interactive keyframe editing PRs are merged in.
 */
const AggregateKeyframeEditor: React.VFC<IAggregateKeyframeEditorProps> = (
  props,
) => {
  const {cur, connected, itemKey, isAggregateEditingInCurvePopover} =
    useAggregateKeyframeEditorUtils(props)

  const {isPointerBeingCaptured} = usePointerCapturing(
    'AggregateKeyframeEditor Connector',
  )

  const [popoverNode, openPopover, closePopover] = usePopover(
    () => {
      const rightDims = val(props.layoutP.rightDims)

      return {
        debugName: 'Connector',
        closeWhenPointerIsDistant: !isPointerBeingCaptured(),
        constraints: {
          minX: rightDims.screenX + POPOVER_MARGIN_PX,
          maxX: rightDims.screenX + rightDims.width - POPOVER_MARGIN_PX,
        },
      }
    },
    () => {
      return (
        <AggregateCurveEditorPopover {...props} closePopover={closePopover} />
      )
    },
  )

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

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
        itemKey={itemKey}
        keyframes={cur.keyframes}
        position={cur.position}
        theme={{
          isSelected: cur.selected,
        }}
        isAllHere={cur.allHere}
      />
      {connected ? (
        <ConnectorLine
          ref={nodeRef}
          connectorLengthInUnitSpace={connected.length}
          isPopoverOpen={isAggregateEditingInCurvePopover}
          // if all keyframe aggregates are selected
          isSelected={connected.selected}
          openPopover={(e) => {
            if (node) openPopover(e, node)
          }}
        />
      ) : (
        noConnector
      )}
      {popoverNode}
    </AggregateKeyframeEditorContainer>
  )
}

// I think this was pulled out for performance
// 1/10: Not sure this is properly split up
function useAggregateKeyframeEditorUtils(
  props: Pick<
    IAggregateKeyframeEditorProps,
    'index' | 'aggregateKeyframes' | 'selection' | 'viewModel'
  >,
) {
  return usePrism(() => {
    const {index, aggregateKeyframes} = props

    const cur = aggregateKeyframes[index]
    const next = aggregateKeyframes[index + 1]

    const curAndNextAggregateKeyframesMatch =
      next &&
      cur.keyframes.length === next.keyframes.length &&
      cur.keyframes.every(({track}, ind) => next.keyframes[ind].track === track)

    const connected = curAndNextAggregateKeyframesMatch
      ? {
          length: next.position - cur.position,
          selected:
            cur.selected === AggregateKeyframePositionIsSelected.AllSelected &&
            next.selected === AggregateKeyframePositionIsSelected.AllSelected,
        }
      : null

    const aggregatedConnections: AggregatedKeyframeConnection[] = !connected
      ? []
      : cur.keyframes.map(({kf, track}, i) => ({
          ...props.viewModel.sheetObject.address,
          trackId: track.id,
          left: kf,
          right: next.keyframes[i].kf,
        }))

    const allConnections = iif(() => {
      const {projectId, sheetId} = props.viewModel.sheetObject.address

      const selectedConnections = prism
        .memo(
          'selectedConnections',
          () =>
            selectedKeyframeConnections(
              props.viewModel.sheetObject.address.projectId,
              props.viewModel.sheetObject.address.sheetId,
              props.selection,
            ),
          [projectId, sheetId, props.selection],
        )
        .getValue()

      return [...aggregatedConnections, ...selectedConnections]
    })

    const isAggregateEditingInCurvePopover = aggregatedConnections.every(
      (con) => isConnectionEditingInCurvePopover(con),
    )

    const itemKey = prism.memo(
      'itemKey',
      () => {
        if (props.viewModel.type === 'sheetObject') {
          return createStudioSheetItemKey.forSheetObjectAggregateKeyframe(
            props.viewModel.sheetObject,
            cur.position,
          )
        } else {
          return createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
            props.viewModel.sheetObject,
            props.viewModel.pathToProp,
            cur.position,
          )
        }
      },
      [props.viewModel.sheetObject, cur.position],
    )

    return {
      itemKey,
      cur,
      connected,
      isAggregateEditingInCurvePopover,
      allConnections,
    }
  }, [props.aggregateKeyframes[props.index].position])
}

const AggregateCurveEditorPopover: React.FC<
  IAggregateKeyframeEditorProps & {closePopover: (reason: string) => void}
> = React.forwardRef((props, ref) => {
  const {allConnections} = useAggregateKeyframeEditorUtils(props)

  return (
    <EasingPopoverWrapper
      showPopoverEdgeTriangle={false}
      // @ts-ignore @todo
      ref={ref}
    >
      <CurveEditorPopover
        curveConnection={allConnections[0]}
        additionalConnections={allConnections}
        onRequestClose={props.closePopover}
      />
    </EasingPopoverWrapper>
  )
})

const DOT_SIZE_PX = 16
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

/** The keyframe diamond ◆ */
const DotContainer = styled.div<{presence: FocusRelationship | undefined}>`
  position: absolute;
  ${absoluteDims(DOT_SIZE_PX)}
  z-index: 1;

  & svg rect:last-of-type {
    ${({presence}) =>
      presence === FocusRelationship.Hovered
        ? `stroke: white !important; stroke-width: 2px;`
        : ''}
  }
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

const AggregateKeyframeDot = React.forwardRef(AggregateKeyframeDot_ref)
function AggregateKeyframeDot_ref(
  props: React.PropsWithChildren<{
    itemKey: StudioSheetItemKey
    theme: IDotThemeValues
    isAllHere: boolean
    position: number
    keyframes: KeyframeWithTrack[]
  }>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [attrs, presence] = usePresence({key: props.itemKey})
  presence.useRelationships(
    () =>
      props.keyframes.map((kf) => ({
        affects: kf.itemKey,
        relationship: FocusRelationship.Hovered,
      })),
    props.keyframes,
  )
  return (
    <>
      <HitZone
        ref={ref}
        {...attrs}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: false,
          position: props.position,
        })}
      />
      <DotContainer presence={presence.current}>
        {props.isAllHere ? (
          <AggregateDotAllHereSvg {...props.theme} />
        ) : (
          <AggregateDotSomeHereSvg {...props.theme} />
        )}
      </DotContainer>
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

export default AggregateKeyframeEditor

function iif<F extends () => any>(fn: F): ReturnType<F> {
  return fn()
}
