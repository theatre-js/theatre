import React from 'react'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {ToolConfigIcon} from '@theatre/studio/TheatreStudio'

const Container = styled(ToolbarIconButton)`
  ${pointerEventsAutoInNormalMode};
  & > svg {
    width: 1em;
    height: 1em;
    pointer-events: none;
  }
`

const IconButton: React.FC<{
  config: ToolConfigIcon
}> = ({config}) => {
  return (
    <Container
      onClick={config.onClick}
      title={config.title}
      dangerouslySetInnerHTML={{__html: config['svgSource'] ?? ''}}
    />
  )
}

export default IconButton
