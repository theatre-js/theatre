import type {ReactElement} from 'react'
import React, {forwardRef} from 'react'
import type {ButtonProps} from 'reakit'
import {Button} from 'reakit'
import type {IconType} from 'react-icons'
import {Tooltip, TooltipReference, useTooltipState} from './Tooltip'
import styled from 'styled-components'

export interface IconButtonProps extends Exclude<ButtonProps, 'children'> {
  icon: ReactElement<IconType>
  label: string
}

const _TooltipRef = styled(TooltipReference)`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  height: 1.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  &:first-child {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }

  &:last-child {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }

  &:focus {
    outline: none;
  }

  color: rgba(55, 65, 81, 1);
  background-color: rgba(243, 244, 246, 1);

  &:hover {
    background-color: rgba(229, 231, 235, 1);
  }

  border: 0 transparent;
`
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({label, icon, className, ...props}, ref) => {
    const tooltip = useTooltipState()
    return (
      <>
        <_TooltipRef
          {...props}
          {...tooltip}
          forwardedAs={Button}
          aria-label={label}
        >
          {icon}
        </_TooltipRef>
        <Tooltip {...tooltip}>{label}</Tooltip>
      </>
    )
  },
)

export default IconButton
