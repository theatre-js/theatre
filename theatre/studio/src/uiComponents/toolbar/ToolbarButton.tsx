import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'

export const Container = styled.button<{disabled?: boolean; primary?: boolean}>`
  ${pointerEventsAutoInNormalMode};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  height: 32px;
  outline: none;
  padding: 0 8px;

  color: ${({disabled, primary}) =>
    disabled === true ? '#919191' : primary === true ? 'white' : '#a8a8a9'};

  background: ${({disabled, primary}) =>
    disabled === true
      ? 'rgba(64, 67, 71, 0.8)'
      : primary === true
        ? 'rgb(41 110 120 / 60%)'
        : 'rgba(40, 43, 47, 0.8)'};

  backdrop-filter: blur(14px);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  box-shadow: 0px 4px 4px -1px rgba(0, 0, 0, 0.48);

  svg {
    display: block;
  }

  &:hover {
    background: ${({disabled, primary}) =>
      disabled === true
        ? 'rgba(64, 67, 71, 0.8)'
        : primary === true
          ? 'rgba(50, 155, 169, 0.80)'
          : 'rgba(59, 63, 69, 0.8)'};
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }
`

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Container>
>((props, ref) => {
  return <Container ref={ref} {...props} />
})

export default ToolbarButton
