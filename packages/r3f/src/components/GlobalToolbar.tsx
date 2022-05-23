import React from 'react'
import {IoCameraOutline} from 'react-icons/io5'
import studio, {ToolbarIconButton} from '@theatre/studio'

export default () => (
  <ToolbarIconButton
    onClick={() => {
      studio.createPane('snapshot')
    }}
    title="Create snapshot"
  >
    <IoCameraOutline />
  </ToolbarIconButton>
)
