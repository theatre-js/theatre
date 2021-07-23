import type {ReactElement} from 'react'
import React from 'react'
import styled from 'styled-components'
import {
  Tooltip,
  TooltipReference,
  useTooltipState,
} from '@theatre/studio/uiComponents/Tooltip'
import type {ButtonProps} from 'reakit'
import {Button} from 'reakit'
import {outlinePanelTheme} from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {darken, opacify} from 'polished'

const {baseBg, baseBorderColor, baseFontColor} = outlinePanelTheme

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

  color: ${baseFontColor};
  --item-bg: ${baseBg};
  --item-border-color: ${baseBorderColor};
  background-color: var(--item-bg);

  &:hover {
    color: ${opacify(1, baseFontColor)};

    --item-bg: ${() => darken(0.07, baseBg)};
    --item-border-color: ${opacify(0.1, baseBorderColor)};
  }

  &.selected {
    color: ${opacify(1, baseFontColor)};

    --item-bg: ${() => darken(0.15, baseBg)};
    --item-border-color: ${opacify(0, baseBorderColor)};
  }

  &:before {
    border: 1px solid var(--item-border-color);
    position: absolute;
    inset: -1px;
    display: block;
    content: ' ';
    z-index: -1;
    pointer-events: none;
    border-radius: 2px;
    box-sizing: border-box;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
  }

  border: 0;
`

const ToolbarIconButton: React.FC<
  Exclude<ButtonProps, 'children'> & {
    icon: ReactElement
    label: string
  }
> = ({label, icon, ...props}) => {
  const tooltip = useTooltipState()
  return (
    <>
      <TheButton
        {...tooltip}
        forwardedAs={Button}
        aria-label={label}
        onClick={props.onClick}
      >
        {icon}
      </TheButton>
      <Tooltip {...tooltip}>{label}</Tooltip>
    </>
  )
}

export default ToolbarIconButton
