import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@theatre/dataverse'
import {Box, val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'

const HitZone = styled.div`
  z-index: 1;
  cursor: ew-resize;

  ${DopeSnapHitZoneUI.CSS}

  #pointer-root.draggingPositionInSequenceEditor & {
    ${DopeSnapHitZoneUI.CSS_WHEN_SOMETHING_DRAGGING}
  }
`

const Container = styled.div`
  position: absolute;
  &::after {
    content: 'snap';
    background: red;
    pointer-events: none;
  }
`

export type ISnapTargetPRops = {
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: {nodeHeight: number}
  position: number
}

const SnapTarget: React.VFC<ISnapTargetPRops> = (props) => {
  return (
    <Container
      style={{
        top: `${props.leaf.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          props.position
        }px))`,
      }}
    >
      <HitZone
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: false,
          position: props.position,
        })}
      />
    </Container>
  )
}

export default SnapTarget

export const snapPositionsB = new Box<{
  [key: string]: {[key: string]: number[]}
}>({})
export const snapPositionsD = snapPositionsB.derivation
