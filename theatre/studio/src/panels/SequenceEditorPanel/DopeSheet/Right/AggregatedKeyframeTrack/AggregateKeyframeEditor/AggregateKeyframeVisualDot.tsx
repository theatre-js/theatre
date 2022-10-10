import React from 'react'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {PresenceFlag} from '@theatre/studio/uiComponents/usePresence'
import styled from 'styled-components'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const DOT_SIZE_PX = 16
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 2

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

  position: absolute;
  ${absoluteDims(12)};
  ${pointerEventsAutoInNormalMode};

  &:hover
    + ${DotContainer},
    #pointer-root.draggingPositionInSequenceEditor
    &:hover
    + ${DotContainer} {
    ${absoluteDims(DOT_HOVER_SIZE_PX)}
  }
`

export function AggregateKeyframeVisualDot(props: {
  flag: PresenceFlag | undefined
  isSelected: AggregateKeyframePositionIsSelected | undefined
  isAllHere: boolean
}) {
  const theme: IDotThemeValues = {
    isSelected: props.isSelected,
    flag: props.flag,
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
  flag: PresenceFlag | undefined
}
const SELECTED_COLOR = '#F2C95C'
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
      stroke={theme.flag === PresenceFlag.Primary ? 'white' : undefined}
      strokeWidth={theme.flag === PresenceFlag.Primary ? '2px' : undefined}
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
      stroke={
        theme.flag === PresenceFlag.Primary ? 'white' : selectionColorAll(theme)
      }
      strokeWidth={theme.flag === PresenceFlag.Primary ? '2px' : undefined}
    />
  </svg>
)
