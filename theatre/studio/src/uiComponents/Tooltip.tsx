import type {VFC} from 'react'
import React from 'react'
import {Tooltip as TooltipImpl, TooltipReference, useTooltipState} from 'reakit'
import type {TooltipProps} from 'reakit'
import styled from 'styled-components'

export {TooltipReference, useTooltipState}

const Container = styled(TooltipImpl)`
  padding: 8px 14px;

  font-size: 11px;
  line-height: 1.25em;
  border-radius: 2px;
  background-color: #201f20;
  color: white;
  pointer-events: none;
  font-weight: 500;
`

export const Tooltip: VFC<TooltipProps> = ({className, ...props}) => (
  <Container {...props} className={className as string} />
)
