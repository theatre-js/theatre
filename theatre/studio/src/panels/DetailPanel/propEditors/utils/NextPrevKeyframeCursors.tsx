import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {transparentize} from 'polished'
import React from 'react'
import styled, {css} from 'styled-components'

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

const CurButton = styled(Button)<{isOn: boolean}>`
  &:hover {
    color: #e0c917;
  }
  color: ${(props) =>
    props.isOn ? nextPrevCursorsTheme.onColor : nextPrevCursorsTheme.offColor};
`

const pointerEventsNone = css`
  pointer-events: none !important;
`

const PrevOrNextButton = styled(Button)<{available: boolean}>`
  color: ${(props) =>
    props.available
      ? nextPrevCursorsTheme.onColor
      : nextPrevCursorsTheme.offColor};

  ${(props) =>
    props.available ? pointerEventsAutoInNormalMode : pointerEventsNone};
`

const Prev = styled(PrevOrNextButton)<{available: boolean}>`
  transform: translateX(2px);
  ${Container}:hover & {
    transform: translateX(-7px);
  }
`
const Next = styled(PrevOrNextButton)<{available: boolean}>`
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

const NextPrevKeyframeCursors: React.FC<{
  prev?: Keyframe
  cur?: Keyframe
  next?: Keyframe
  jumpToPosition: (position: number) => void
  toggleKeyframeOnCurrentPosition: () => void
}> = (props) => {
  return (
    <Container>
      <Prev
        available={!!props.prev}
        onClick={() => {
          if (props.prev) {
            props.jumpToPosition(props.prev.position)
          }
        }}
      >
        <Icons.Prev />
      </Prev>
      <CurButton
        isOn={!!props.cur}
        onClick={() => {
          props.toggleKeyframeOnCurrentPosition()
        }}
      >
        <Icons.Cur />
      </CurButton>
      <Next
        available={!!props.next}
        onClick={() => {
          if (props.next) {
            props.jumpToPosition(props.next.position)
          }
        }}
      >
        <Icons.Next />
      </Next>
    </Container>
  )
}

export default NextPrevKeyframeCursors
