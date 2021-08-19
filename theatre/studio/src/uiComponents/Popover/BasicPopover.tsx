import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import styled from 'styled-components'
import {popoverBackgroundColor} from './Popover'
import PopoverArrow, {popoverArrowColor} from './PopoverArrow'

const Container = styled.div`
  position: absolute;
  background: ${popoverBackgroundColor};
  ${popoverArrowColor(popoverBackgroundColor)};
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
