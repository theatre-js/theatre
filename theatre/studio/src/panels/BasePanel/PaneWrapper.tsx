import type {$FixMe} from '@theatre/shared/utils/types'
import type {PanelPosition} from '@theatre/studio/store/types'
import type {PaneInstance} from '@theatre/studio/TheatreStudio'
import React from 'react'
import styled from 'styled-components'
import {
  TitleBar,
  F2 as F2Impl,
} from '@theatre/studio/panels/ObjectEditorPanel/ObjectEditorPanel'
import BasePanel from './BasePanel'
import PanelDragZone from './PanelDragZone'
import PanelWrapper from './PanelWrapper'
import {ErrorBoundary} from 'react-error-boundary'

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

const ErrorContainer = styled.div`
  padding: 12px;

  & > pre {
    border: 1px solid #ff62624f;
    background-color: rgb(255 0 0 / 5%);
    margin: 8px 0;
    padding: 8px;
    font-family: monospace;
    overflow: scroll;
    color: #ff9896;
  }
`

const ErrorFallback: React.FC<{error: Error}> = (props) => {
  return (
    <ErrorContainer>
      An Error occured rendering this pane. Open the console for more info.
      <pre>
        {JSON.stringify(
          {message: props.error.message, stack: props.error.stack},
          null,
          2,
        )}
      </pre>
    </ErrorContainer>
  )
}

const Content: React.FC<{paneInstance: PaneInstance<$FixMe>}> = ({
  paneInstance,
}) => {
  const Comp = paneInstance.definition.component
  return (
    <Container>
      <PanelDragZone>
        <TitleBar>
          <Title>{paneInstance.instanceId}</Title>
        </TitleBar>
      </PanelDragZone>
      <F2>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Comp id={paneInstance.instanceId} object={paneInstance.object} />
        </ErrorBoundary>
      </F2>
    </Container>
  )
}

export default PaneWrapper
