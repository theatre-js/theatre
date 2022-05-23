import React from 'react'
import styled from 'styled-components'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import ProjectsList from './ProjectsList/ProjectsList'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import useHotspot from '@theatre/studio/uiComponents/useHotspot'

const Container = styled.div<{pin: boolean}>`
  background-color: transparent;
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 0px;
  right: 0;
  z-index: ${panelZIndexes.outlinePanel};
  display: ${({pin}) => (pin ? 'block' : 'none')};
`

const headerHeight = `32px`

const Body = styled.div`
  ${pointerEventsAutoInNormalMode};
  position: absolute;
  top: calc(${headerHeight} + 8px);
  left: 8px;
  height: auto;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0;
  user-select: none;
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`

const OutlinePanel: React.FC<{}> = (props) => {
  const pin = useVal(getStudio().atomP.ahistoric.pinOutline)

  const active = useHotspot('left')

  return (
    <Container pin={pin || active}>
      <Body data-testid="OutlinePanel-Content">
        <ProjectsList />
      </Body>
    </Container>
  )
}

export default OutlinePanel
