import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'
import PopoverArrow, {popoverArrowColors} from './PopoverArrow'

export const popoverBackgroundColor = transparentize(0.05, `#2a2a31`)

const Container = styled.div`
  position: absolute;
  background: ${popoverBackgroundColor};
  ${popoverArrowColors({
    fill: popoverBackgroundColor,
    innerStroke: `#505159`,
    outerStroke: `black`,
  })};
  color: white;
  padding: 0;
  margin: 0;
  cursor: default;
  ${pointerEventsAutoInNormalMode};
  border-radius: 3px;
  z-index: 10000;
  border: 1px solid #505159;
  box-shadow: 0 6px 8px -4px black, 0 0 0 1px black;
  backdrop-filter: blur(8px);
`

const BasicPopover: React.FC<{className?: string}> = React.forwardRef(
  ({children, className}, ref) => {
    return (
      <Container className={className} ref={ref as $IntentionalAny}>
        <PopoverArrow />
        {children}
      </Container>
    )
  },
)

export default BasicPopover
