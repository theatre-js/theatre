import type {ReactElement} from 'react'
import React, {forwardRef} from 'react'
import type {ButtonProps} from 'reakit'
import {Button} from 'reakit'
import type {IconType} from 'react-icons'
import {Tooltip, TooltipReference, useTooltipState} from './Tooltip'
import styled from 'styled-components'
import {transparentize} from 'polished'

export interface IconButtonProps extends Exclude<ButtonProps, 'children'> {
  icon: ReactElement<IconType>
  label: string
}

const TheButton = styled(TooltipReference)`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: 11px;
  line-height: 1.25em;
  font-weight: 600;
  height: 24px;
  padding-left: 0.5em;
  padding-right: 0.5em;
  color: #e6e6e5;
  background-color: #313131ba;
  border: 0 transparent;

  &:first-child {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  &:last-child {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }

  &:focus {
    outline: none;
  }

  color: #e6e6e5;
  background-color: #313131;

  &:hover {
    background-color: ${transparentize(0.5, '#313131')};
  }

  border: 0 transparent;
`
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({label, icon, className, ...props}, ref) => {
    const tooltip = useTooltipState()
    return (
      <>
        <TheButton
          {...props}
          {...tooltip}
          forwardedAs={Button}
          aria-label={label}
        >
          {icon}
        </TheButton>
        <Tooltip {...tooltip}>{label}</Tooltip>
      </>
    )
  },
)

export default IconButton
