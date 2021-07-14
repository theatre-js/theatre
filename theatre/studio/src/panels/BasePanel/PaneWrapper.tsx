import type {$FixMe} from '@theatre/shared/utils/types'
import type {PanelPosition} from '@theatre/studio/store/types'
import type {PaneInstance} from '@theatre/studio/TheatreStudio'
import React from 'react'
import styled from 'styled-components'
import {
  F1,
  F2 as F2Impl,
} from '@theatre/studio/panels/ObjectEditorPanel/ObjectEditorPanel'
import BasePanel from './BasePanel'
import PanelDragZone from './PanelDragZone'
import PanelWrapper from './PanelWrapper'

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenLeft', distance: 0.3},
    right: {from: 'screenRight', distance: 0.3},
    top: {from: 'screenTop', distance: 0.3},
    bottom: {from: 'screenBottom', distance: 0.3},
  },
}

const minDims = {width: 300, height: 300}

const PaneWrapper: React.FC<{
  paneInstance: PaneInstance<$FixMe>
}> = ({paneInstance}) => {
  return (
    <BasePanel
      panelId={`pane-${paneInstance.instanceId}`}
      defaultPosition={defaultPosition}
      minDims={minDims}
    >
      <Content paneInstance={paneInstance} />
    </BasePanel>
  )
}

const Container = styled(PanelWrapper)`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  width: 100%;
`

const F2 = styled(F2Impl)`
  position: relative;
`

const Content: React.FC<{paneInstance: PaneInstance<$FixMe>}> = ({
  paneInstance,
}) => {
  const Comp = paneInstance.definition.component
  return (
    <Container>
      <PanelDragZone>
        <F1>
          <Title>{paneInstance.instanceId}</Title>
        </F1>
      </PanelDragZone>
      <F2>
        <Comp id={paneInstance.instanceId} object={paneInstance.object} />
      </F2>
    </Container>
  )
}

export default PaneWrapper
