import type {$IntentionalAny} from '@theatre/core/types/public'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import styled from 'styled-components'
import PopoverArrow from './PopoverArrow'

export const popoverBackgroundColor = `rgb(51 45 66 / 40%)`

const Container = styled.div`
  position: absolute;
  --popover-bg: ${popoverBackgroundColor};
  --popover-inner-stroke: #505159;
  --popover-outer-stroke: rgb(86 100 110 / 46%);

  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 25%) 0px 2px 4px;
  backdrop-filter: blur(8px) saturate(300%) contrast(65%) brightness(55%);
  /* background-color: rgb(45 46 66 / 50%); */
  border: 0.5px solid var(--popover-outer-stroke);

  background: var(--popover-bg);
  /* border: 1px solid var(--popover-inner-stroke); */

  color: white;
  padding: 1px 2px 1px 10px;
  margin: 0;
  cursor: default;
  ${pointerEventsAutoInNormalMode};
  z-index: 10000;

  & a {
    color: inherit;
  }
`

const BasicPopover: React.FC<{
  className?: string
  showPopoverEdgeTriangle?: boolean
  children: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}> = React.forwardRef(
  (
    {
      children,
      className,
      showPopoverEdgeTriangle: showPopoverEdgeTriangle = false,
    },
    ref,
  ) => {
    return (
      <Container className={className} ref={ref as $IntentionalAny}>
        {showPopoverEdgeTriangle ? <PopoverArrow /> : undefined}
        {children}
      </Container>
    )
  },
)

export default BasicPopover
