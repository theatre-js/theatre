import React from 'react'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import styled from 'styled-components'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'

const DOT_SIZE_PX = 16
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

/** The keyframe diamond ◆ */
const DotContainer = styled.div`
  position: absolute;
  ${absoluteDims(DOT_SIZE_PX)}
  z-index: 1;
`

// hmm kinda weird to organize like this (exporting `HitZone`). Maybe there's a way to re-use
// this interpolation of `DotContainer` using something like extended components or something.
export const HitZone = styled.div`
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

export function AggregateKeyframeVisualDot(props: {
  isSelected: AggregateKeyframePositionIsSelected | undefined
  isAllHere: boolean
}) {
  const theme: IDotThemeValues = {
    isSelected: props.isSelected,
  }

  return (
    <DotContainer>
      {props.isAllHere ? (
        <AggregateDotAllHereSvg {...theme} />
      ) : (
        <AggregateDotSomeHereSvg {...theme} />
      )}
    </DotContainer>
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
