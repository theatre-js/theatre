import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  height: 36px;
  pointer-events: none;

  display: flex;
  gap: 1rem;
  justify-content: center;
`

const GlobalToolbar: React.FC = () => {
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

  return <Container>{groups}</Container>
}

export default GlobalToolbar
