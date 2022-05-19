import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PropWithChildren} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {lockedCursorCssVarName} from '@theatre/studio/uiComponents/PointerEventsHandler'
import {SNAP_CURSOR_SVG_URL} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/SNAP_CURSOR_SVG_URL'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {includeLockFrameStampAttrs} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {AggregateKeyframePositionIsSelected} from './AggregatedKeyframeTrack'
import type {AggregateKeyframe} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'

const AggregateKeyframeEditorContainer = styled.div`
  position: absolute;
`

const noConnector = <></>

export type IAggregateKeyframeEditorProps = {
  index: number
  aggregateKeyframes: {
    position: number
    selected: AggregateKeyframePositionIsSelected | undefined
    keyframes: {kf: Keyframe; track: {id: SequenceTrackId; data: TrackData}}[]
  }[]
  layoutP: Pointer<SequenceEditorPanelLayout>
  viewModel: SequenceEditorTree_PropWithChildren
  selection: undefined | DopeSheetSelection
}

const AggregateKeyframeEditor: React.VFC<IAggregateKeyframeEditorProps> = (
  props,
) => {
  const {index, aggregateKeyframes} = props
  const cur = aggregateKeyframes[index]
  const next = aggregateKeyframes[index + 1]

  const isAllHere = cur.keyframes.length === props.viewModel.children.length
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
        isAllHere={isAllHere}
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
const HIT_ZONE_SIZE_PX = 12
const SNAP_CURSOR_SIZE_PX = 34
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

const dims = (size: number) => `
  left: ${-size / 2}px;
  top: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

/** The keyframe diamond ◆ */
const DotContainer = styled.div`
  position: absolute;
  ${dims(DOT_SIZE_PX)}
  z-index: 1;
`

const HitZone = styled.div`
  position: absolute;
  ${dims(HIT_ZONE_SIZE_PX)};

  z-index: 2;

  cursor: ew-resize;

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});

    // ⸢⸤⸣⸥ thing
    // This box extends the hitzone so the user does not
    // accidentally leave the hitzone
    &:hover:after {
      position: absolute;
      top: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      left: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      width: ${SNAP_CURSOR_SIZE_PX}px;
      height: ${SNAP_CURSOR_SIZE_PX}px;
      display: block;
      content: ' ';
      background: url(${SNAP_CURSOR_SVG_URL}) no-repeat 100% 100%;
      // This icon might also fit: GiConvergenceTarget
    }
  }

  &.beingDragged {
    pointer-events: none !important;
  }

  &:hover + ${DotContainer}, &.beingDragged + ${DotContainer} {
    ${dims(DOT_HOVER_SIZE_PX)}
  }
`

const AggregateKeyframeDot = React.forwardRef(AggregateKeyframeDot_ref)
function AggregateKeyframeDot_ref(
  props: React.PropsWithChildren<{
    theme: IDotThemeValues
    isAllHere: boolean
    position: number
    keyframes: AggregateKeyframe[]
  }>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <>
      <HitZone
        ref={ref}
        {...includeLockFrameStampAttrs(props.position)}
        {...DopeSnap.includePositionSnapAttrs(props.position)}
        // className={isDragging ? 'beingDragged' : ''}
      />
      <DotContainer>
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
