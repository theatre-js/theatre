import {useVal} from '@theatre/react'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  z-index: ${panelZIndexes.toolbar};

  top: 12px;
  right: 12px;
  left: 12px;
  height: 36px;
  pointer-events: none;

  display: flex;
  gap: 1rem;
  justify-content: center;
`

const Bg = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  border-radius: 4px;
  padding: 6px 6px;

  ${pointerEventsAutoInNormalMode};

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
  }
`

const GlobalToolbar: React.FC<{}> = (props) => {
  const groups: Array<React.ReactNode> = []
  const extensionsById = useVal(getStudio().atomP.ephemeral.extensions.byId)

  for (const [, extension] of Object.entries(extensionsById)) {
    if (!extension) continue
    if (extension.globalToolbar) {
      groups.push(
        <extension.globalToolbar.component
          key={'extensionToolbar-' + extension.id}
        />,
      )
    }
  }

  if (groups.length === 0) return null

  return (
    <Container>
      <Bg>{groups}</Bg>
    </Container>
  )
}

export default GlobalToolbar
