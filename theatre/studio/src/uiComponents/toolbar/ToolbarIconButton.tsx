import type {ReactElement} from 'react'
import React from 'react'
import styled from 'styled-components'
import type {ButtonProps} from 'reakit'
import {outlinePanelTheme} from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {darken, opacify} from 'polished'

const {baseBg, baseBorderColor, baseFontColor} = outlinePanelTheme

export const TheButton = styled.button`
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
  return (
    <>
      <TheButton aria-label={label} onClick={props.onClick} title={label}>
        {icon}
      </TheButton>
    </>
  )
}

export default ToolbarIconButton
