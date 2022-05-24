import React from 'react'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import {registerContextualWebComponent} from '@theatre/studio/utils/contextualWebComponents'
import styled from 'styled-components'

const Container = styled(ToolbarIconButton)`
  & > svg {
    width: 1em;
    height: 1em;
  }
`

const TheatreJSToolbarIcon: React.FC<{
  'svg-source'?: string
  'tooltip-title'?: string
}> = (props) => {
  return (
    <Container
      title={props['tooltip-title']}
      dangerouslySetInnerHTML={{__html: props['svg-source'] ?? ''}}
    />
  )
}

registerContextualWebComponent(TheatreJSToolbarIcon, 'theatrejs-toolbar-icon', {
  'svg-source': 'string',
  'tooltip-title': 'string',
})

export default TheatreJSToolbarIcon
