// @flow
import React from 'react'
import css from './index.css'
import SettingsDivision from '$studio/common/components/SettingsDivision'
import PanelOutput from '$studio/common/components/PanelOutput'

type Props = {
  setCurrentlyDraggingOutput: Function,
  clearCurrentlyDraggingOutput: Function,
}

const Settings = (props: Props) => {
  return (
    <div className={css.container}>
      <SettingsDivision title='Outputs'>
        <PanelOutput
          type='Selected Node'
          onDragStart={() => props.setCurrentlyDraggingOutput('selectedNode')}
          onDragEnd={() => props.clearCurrentlyDraggingOutput()}/>
      </SettingsDivision>
    </div>
  )
}

export default Settings