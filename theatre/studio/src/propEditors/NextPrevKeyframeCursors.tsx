import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {VoidFn} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {transparentize} from 'polished'
import React, {useMemo} from 'react'
import styled, {css} from 'styled-components'
import {PresenceFlag} from '@theatre/studio/uiComponents/usePresence'
import usePresence from '@theatre/studio/uiComponents/usePresence'
import type Sequence from '@theatre/core/sequences/Sequence'

/**
 * **Notes**
 *
 * * This could be used for either compound or simple
 * * The props are flattened to optimize for few re-renders in combination with default `React.memo`
 */
export type NearbyKeyframesControls = {
  /**
   * `sequence` is necessary for setting the position. Again, this is not just a function, because it's easier for
   * us to ensure that React.memo will work optimally.
   */
  sequence: Sequence
  prevPosition?: number
  prevKey?: StudioSheetItemKey
  curKey?: StudioSheetItemKey
  /**
   * Try to make sure this is memoized as best as possible.
   * It should not need to be a different function every time
   * the playhead changes position.
   */
  curToggle: VoidFn
  nextPosition?: number
  nextKey?: StudioSheetItemKey
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  margin: 0 0px 0 2px;
  position: relative;
  z-index: 0;
  opacity: 0.7;

  &:after {
    position: absolute;
    left: -14px;
    right: -14px;
    top: -2px;
    bottom: -2px;
    content: ' ';
    display: none;
    z-index: -1;
    background: ${transparentize(0.2, 'black')};
  }

  &:hover {
    opacity: 1;
    &:after {
      display: block;
    }
  }
`

const Button = styled.div`
  background: none;
  position: relative;
  border: 0;
  transition: transform 0.1s ease-out;
  z-index: 0;
  outline: none;
  cursor: pointer;

  &:after {
    display: none;
    ${Container}:hover & {
      display: block;
    }
    position: absolute;
    left: -4px;
    right: -4px;
    top: -4px;
    bottom: -4px;
    content: ' ';
    z-index: -1;
  }
`

export const nextPrevCursorsTheme = {
  offColor: '#555',
  onColor: '#e0c917',
}

const CurButton = styled(Button)<{
  isOn: boolean
  presence: PresenceFlag | undefined
}>`
  &:hover {
    color: #e0c917;
  }

  color: ${(props) =>
    props.presence === PresenceFlag.Primary
      ? 'white'
      : props.isOn
      ? nextPrevCursorsTheme.onColor
      : nextPrevCursorsTheme.offColor};
`

const pointerEventsNone = css`
  pointer-events: none !important;
`

const PrevOrNextButton = styled(Button)<{
  available: boolean
  flag: PresenceFlag | undefined
}>`
  color: ${(props) =>
    props.flag === PresenceFlag.Primary
      ? 'white'
      : props.available
      ? nextPrevCursorsTheme.onColor
      : nextPrevCursorsTheme.offColor};

  ${(props) =>
    props.available ? pointerEventsAutoInNormalMode : pointerEventsNone};
`

const Prev = styled(PrevOrNextButton)<{
  available: boolean
  flag: PresenceFlag | undefined
}>`
  transform: translateX(2px);
  ${Container}:hover & {
    transform: translateX(-7px);
  }
`
const Next = styled(PrevOrNextButton)<{
  available: boolean
  flag: PresenceFlag | undefined
}>`
  transform: translateX(-2px);
  ${Container}:hover & {
    transform: translateX(7px);
  }
`

namespace Icons {
  const Chevron_Group = styled.g`
    stroke-width: 1;
    ${PrevOrNextButton}:hover & path {
      stroke-width: 3;
    }
  `

  export const Prev = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Chevron_Group transform={`translate(6 3)`}>
        <path d="M4 1L1 4L4 7" stroke="currentColor" />
      </Chevron_Group>
    </svg>
  )

  export const Next = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Chevron_Group transform={`translate(1 3)`}>
        <path d="M1 1L4 4L1 7" stroke="currentColor" />
      </Chevron_Group>
    </svg>
  )

  const Cur_Group = styled.g`
    stroke-width: 0;
    ${CurButton}:hover & path {
      stroke: currentColor;
      stroke-width: 2;
    }
  `

  export const Cur = () => (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Cur_Group transform="translate(1 4)">
        <path d="M3 0L6 3L3 6L0 3L3 0Z" fill="currentColor" />
      </Cur_Group>
    </svg>
  )
}

// React.memo is crucial here to ensure that when none of these flat properties change,
// that we don't recreate the element or anything like that. This is a huge speed-up by
// preventing DOM mutation on every frame.
const NextPrevKeyframeCursors = React.memo(
  ({
    sequence,
    curKey,
    curToggle,
    nextKey,
    nextPosition,
    prevKey,
    prevPosition,
  }: NearbyKeyframesControls) => {
    const prevPresence = usePresence(prevKey)
    const curPresence = usePresence(curKey)
    const nextPresence = usePresence(nextKey)
    const prevJump = useMemo(() => {
      if (prevPosition == null) return
      return () => {
        sequence.position = prevPosition
      }
    }, [sequence, prevPosition])
    const nextJump = useMemo(() => {
      if (nextPosition == null) return
      return () => {
        sequence.position = nextPosition
      }
    }, [sequence, nextPosition])

    return (
      <Container>
        <Prev
          available={!!prevKey}
          onClick={prevJump}
          flag={prevPresence.flag}
          {...prevPresence.attrs}
        >
          <Icons.Prev />
        </Prev>
        <CurButton
          isOn={curKey != null}
          onClick={curToggle}
          presence={curPresence.flag}
          {...curPresence.attrs}
        >
          <Icons.Cur />
        </CurButton>
        <Next
          available={!!nextKey}
          onClick={nextJump}
          flag={nextPresence.flag}
          {...nextPresence.attrs}
        >
          <Icons.Next />
        </Next>
      </Container>
    )
  },
)

export default NextPrevKeyframeCursors
