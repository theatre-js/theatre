import React from 'react'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {ToolConfigIcon} from '@theatre/core/types/public'

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
  testId?: string
}> = ({config, testId}) => {
  return (
    <Container
      onClick={config.onClick}
      data-testid={testId}
      title={config.title}
      dangerouslySetInnerHTML={{__html: config['svgSource'] ?? ''}}
    />
  )
}

export default IconButton
