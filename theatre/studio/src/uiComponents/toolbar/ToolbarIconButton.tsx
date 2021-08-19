import styled from 'styled-components'
import {outlinePanelTheme} from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {darken, opacify} from 'polished'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import mergeRefs from 'react-merge-refs'
import MinimalTooltip from '@theatre/studio/uiComponents/Popover/MinimalTooltip'

const {baseBg, baseBorderColor, baseFontColor} = outlinePanelTheme

const Container = styled.button`
  ${pointerEventsAutoInNormalMode};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 24px;
  height: 24px;
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

const ToolbarIconButton: typeof Container = React.forwardRef(
  ({title, ...props}, ref: $IntentionalAny) => {
    const [tooltip, localRef] = useTooltip(
      {enabled: typeof title === 'string'},
      () => <MinimalTooltip>{title}</MinimalTooltip>,
    )

    return (
      <>
        {tooltip}
        <Container ref={mergeRefs([localRef, ref])} {...props} />{' '}
      </>
    )
  },
) as $IntentionalAny

export default ToolbarIconButton
