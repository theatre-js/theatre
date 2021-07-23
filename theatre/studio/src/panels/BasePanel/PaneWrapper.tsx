import type {$FixMe} from '@theatre/shared/utils/types'
import type {PanelPosition} from '@theatre/studio/store/types'
import type {PaneInstance} from '@theatre/studio/TheatreStudio'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import {F2 as F2Impl, TitleBar} from './common'
import BasePanel from './BasePanel'
import PanelDragZone from './PanelDragZone'
import PanelWrapper from './PanelWrapper'
import {ErrorBoundary} from 'react-error-boundary'
import {IoClose} from 'react-icons/all'
import getStudio from '@theatre/studio/getStudio'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'

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

  box-shadow: 2px 2px 0 rgb(0 0 0 / 11%);
  z-index: ${panelZIndexes.pluginPanes};
`

const Title = styled.div`
  width: 100%;
`

const PaneTools = styled.div`
  display: flex;
  align-items: center;
  opacity: 1;
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
`

const ClosePanelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: 11px;
  height: 10px;
  width: 18px;
  color: #adadadb3;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    color: white;
  }
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
  const closePane = useCallback(() => {
    getStudio().paneManager.destroyPane(paneInstance.instanceId)
  }, [paneInstance])

  return (
    <Container>
      <PanelDragZone>
        <TitleBar>
          <PaneTools>
            <ClosePanelButton onClick={closePane} title={'Close Pane'}>
              <IoClose />
            </ClosePanelButton>
          </PaneTools>
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
