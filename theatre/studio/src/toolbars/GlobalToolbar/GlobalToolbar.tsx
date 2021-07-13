import {useVal} from '@theatre/dataverse-react'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  z-index: 50;
  top: 12px;
  right: 12px;
  left: 12px;
  pointer-events: none;

  display: flex;
  gap: 1rem;
`

const GlobalToolbar: React.FC<{}> = (props) => {
  const groups: Array<React.ReactNode> = []
  const extensions = useVal(getStudio().extensionsP)

  for (const [, extension] of Object.entries(extensions)) {
    if (extension.globalToolbar) {
      groups.push(
        <extension.globalToolbar.component
          key={'extensionToolbar-' + extension.id}
        />,
      )
    }
  }

  return <Container>{groups}</Container>
}

export default GlobalToolbar
