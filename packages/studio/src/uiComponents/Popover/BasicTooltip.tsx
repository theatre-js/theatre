import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import type {$IntentionalAny} from '@theatre/core/types/public'

const Container = styled.div`
  position: absolute;

  color: white;
  padding: 0;
  margin: 0;
  cursor: default;
  ${pointerEventsAutoInNormalMode};

  color: white;
  box-sizing: border-box;

  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 25%) 0px 2px 4px;
  backdrop-filter: blur(8px) saturate(300%) contrast(65%) brightness(55%);
  background-color: rgb(45 46 66 / 50%);
  border: 0.5px solid rgb(86 100 110 / 46%);
  z-index: 10000;
  padding: 8px 8px;
  font-size: 10px;

  z-index: 10000;

  & a {
    color: inherit;
  }

  max-width: 240px;
  padding: 8px;
  pointer-events: none !important;
`

const BasicTooltip = React.forwardRef(
  (
    {
      children,
      className,
    }: {
      className?: string
      showPopoverEdgeTriangle?: boolean
      children: React.ReactNode
    },
    ref,
  ) => {
    return (
      <Container className={className} ref={ref as $IntentionalAny}>
        {children}
      </Container>
    )
  },
)

export default BasicTooltip
