import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {ComponentPropsWithRef, ReactNode} from 'react'
import React, {forwardRef, useState} from 'react'

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

  color: ${({pinned}) => (pinned ? 'rgba(255, 255, 255, 0.8)' : '#A8A8A9')};

  background: rgba(40, 43, 47, 0.8);
  backdrop-filter: blur(14px);
  border: none;
  border-bottom: 1px solid
    ${({pinned}) =>
      pinned ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 2px;

  &:hover {
    background: rgba(59, 63, 69, 0.8);
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }

  svg {
    display: block;
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
    const [hovered, setHovered] = useState(false)

    const showHint = hovered || hint

    return (
      <Container
        {...props}
        pinned={pinned}
        ref={ref}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        {/* Necessary for hover to work properly. */}
        <div
          style={{
            pointerEvents: 'none',
            width: 'fit-content',
            height: 'fit-content',
            inset: 0,
          }}
        >
          {showHint && !pinned
            ? pinHintIcon
            : showHint && pinned
            ? unpinHintIcon
            : icon}
        </div>
      </Container>
    )
  },
)

export default PinButton
