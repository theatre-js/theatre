import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import type {$FixMe, $IntentionalAny} from '@theatre/core/types/public'
import {mergeRefs} from 'react-merge-refs'
import ToolbarSwitchSelectContainer from './ToolbarSwitchSelectContainer'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'

export const Container = styled.button`
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

  background: rgba(40, 43, 47, 0.8);
  backdrop-filter: blur(14px);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;

  svg {
    display: block;
  }

  &:hover {
    background: rgba(59, 63, 69, 0.8);
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }

  &.selected {
    color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  }

  // Don't blur if in a button group, because it already blurs. We need to blur
  // on the group-level, otherwise we get seams.
  ${ToolbarSwitchSelectContainer} > & {
    backdrop-filter: none;
    filter: none;
    border-radius: 0;

    &:first-child {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    &:last-child {
      border-bottom-right-radius: 2px;
      border-top-right-radius: 2px;
    }
  }

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.95);
  }
`

const ToolbarIconButton: typeof Container = React.forwardRef(
  ({title, ...props}: $FixMe, ref: $FixMe) => {
    const c = useChordial(() => {
      return {
        title,
        items: [],
      }
    })

    return (
      <>
        <Container ref={mergeRefs([c.targetRef, ref])} {...props} />{' '}
      </>
    )
  },
) as $IntentionalAny

export default ToolbarIconButton
