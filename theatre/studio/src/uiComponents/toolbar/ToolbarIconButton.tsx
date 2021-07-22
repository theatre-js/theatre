import type {ReactElement} from 'react'
import React from 'react'
import styled from 'styled-components'
import {Tooltip, TooltipReference} from '@theatre/studio/uiComponents/Tooltip'
import type {ButtonProps} from 'reakit'
import {useTooltipState} from 'reakit'
import {Button} from 'reakit'

export const TheButton = styled(TooltipReference)`
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 28px;
  height: 28px;
  outline: none;

  &:hover {
    background-color: #1a1d23;
    color: white;
    border-color: #4f5661;
  }

  &.selected {
    background-color: #1a1d23;
    color: white;
    &:hover {
      border-color: #272a2d;
    }
  }

  color: #c0c0c0;
  background-color: #222427;
  border: 1px solid #272a2d;
  border-radius: 3px;
  box-shadow: 1px 1px 0px #0000001c;
`

const ToolbarIconButton: React.FC<
  Exclude<ButtonProps, 'children'> & {
    icon: ReactElement
    label: string
  }
> = (props) => {
  const tooltip = useTooltipState()
  return (
    <>
      <TheButton
        {...tooltip}
        forwardedAs={Button}
        aria-label={props.label}
        onClick={props.onClick}
        className={props.className}
      >
        {props.icon}
      </TheButton>
      <Tooltip {...tooltip}>{props.label}</Tooltip>
    </>
  )
}

export default ToolbarIconButton
