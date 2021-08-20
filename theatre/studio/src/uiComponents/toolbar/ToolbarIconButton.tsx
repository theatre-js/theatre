import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import mergeRefs from 'react-merge-refs'
import MinimalTooltip from '@theatre/studio/uiComponents/Popover/MinimalTooltip'

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

  color: rgba(255, 255, 255, 0.75);
  background-color: rgb(47, 49, 53);

  &:hover {
    color: #fff;

    background-color: rgba(28, 30, 32, 0.95);
    &:after {
      border-color: rgba(90, 90, 90, 1);
    }
  }

  &.selected {
    color: #fff;

    background-color: rgba(17, 18, 20, 0.95);
    &:after {
      border-color: rgb(43, 43, 43);
    }
  }

  &:before {
    border: 1px solid rgb(62, 62, 62);
    position: absolute;
    inset: -1px;
    display: block;
    content: ' ';
    z-index: -1;
    pointer-events: none;
    border-radius: 2px;
    box-sizing: border-box;
    box-shadow: 0px 3px 4px -3px rgba(0, 0, 0, 0.49);
  }

  border: 0;
`

const ToolbarIconButton: typeof Container = React.forwardRef(
  ({title, ...props}: $FixMe, ref: $FixMe) => {
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
