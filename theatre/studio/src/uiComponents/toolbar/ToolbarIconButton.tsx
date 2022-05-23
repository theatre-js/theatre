import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import mergeRefs from 'react-merge-refs'
import MinimalTooltip from '@theatre/studio/uiComponents/Popover/MinimalTooltip'
import ToolbarSwitchSelectContainer from './ToolbarSwitchSelectContainer'

const Container = styled.button`
  ${pointerEventsAutoInNormalMode};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  outline: none;

  color: #a8a8a9;

  background: rgba(40, 43, 47, 0.45);
  backdrop-filter: blur(14px);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(59, 63, 69, 0.8);
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }

  &.selected {
    background: rgba(40, 43, 47, 0.9);
    color: white;
  }

  &:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }

  &:last-child {
    border-bottom-right-radius: 2px;
    border-top-right-radius: 2px;
  }

  // Don't blur if in a button group, because it already blurs. We need to blur
  // on the group-level, otherwise we get seams.
  ${ToolbarSwitchSelectContainer} > & {
    backdrop-filter: none;
  }

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.8);

    &:hover {
      background: rgba(59, 63, 69, 0.8);
    }

    &:active {
      background: rgba(82, 88, 96, 0.7);
    }

    &.selected {
      background: rgb(27, 32, 35);
    }
  }
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
