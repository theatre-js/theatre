import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {ComponentPropsWithRef, ReactNode} from 'react'
import React, {forwardRef} from 'react'

const Container = styled.button<{pinned?: boolean}>`
  ${pointerEventsAutoInNormalMode};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  outline: none;

  color: #a8a8a9;

  background: ${({pinned}) =>
    pinned ? 'rgba(40, 43, 47, 0.9)' : 'rgba(40, 43, 47, 0.45)'};
  backdrop-filter: blur(14px);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;

  &:hover {
    background: rgba(59, 63, 69, 0.8);
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.8);

    &:hover {
      background: rgba(59, 63, 69, 0.8);
    }

    &:active {
      background: rgba(82, 88, 96, 0.7);
    }

    &.selected {
      background: rgb(27, 32, 35);
    }
  }
`

interface PinButtonProps extends ComponentPropsWithRef<'button'> {
  icon: ReactNode
  pinHintIcon: ReactNode
  unpinHintIcon: ReactNode
  hint?: boolean
  pinned?: boolean
}

const PinButton = forwardRef<HTMLButtonElement, PinButtonProps>(
  ({hint, pinned, icon, pinHintIcon, unpinHintIcon, ...props}, ref) => {
    return (
      <Container {...props} pinned={pinned} ref={ref}>
        {hint && !pinned ? pinHintIcon : hint && pinned ? unpinHintIcon : icon}
      </Container>
    )
  },
)

export default PinButton
