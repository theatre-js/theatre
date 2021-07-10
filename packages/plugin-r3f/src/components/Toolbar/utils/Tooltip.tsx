import type {VFC} from 'react'
import React from 'react'
import {Tooltip as TooltipImpl, TooltipReference, useTooltipState} from 'reakit'

import type {TooltipProps} from 'reakit'
import styled from 'styled-components'

export {TooltipReference, useTooltipState}

const Container = styled(TooltipImpl)`
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;

  font-size: 0.875rem;
  line-height: 1.25rem;
  border-radius: 0.125rem;
  background-color: rgba(55, 65, 81, 1);
  color: white;
  pointer-events: none;
`

export const Tooltip: VFC<TooltipProps> = ({className, ...props}) => (
  <Container {...props} className={className as string} />
)
