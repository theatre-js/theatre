// @flow
import React from 'react'
import css from './index.css'
import SettingsDivision from '$studio/common/components/SettingsDivision'
import PanelInput from '$studio/common/components/PanelInput'

type Props = $FlowFixMe

const Settings = (props: Props) => {
  const {currentlyDraggingOutput, inputs, updatePanelInput} = props
  return (
    <div className={css.container}>
      <SettingsDivision title='Inputs'>
        <PanelInput
          type={'Selected Node'}
          setInput={() => updatePanelInput({selectedNode: currentlyDraggingOutput.panel})}
          isConnected={(inputs.hasOwnProperty('selectedNode'))}
          shouldAcceptDraggedOutput={(currentlyDraggingOutput && currentlyDraggingOutput.type === 'selectedNode')}/>
      </SettingsDivision>
    </div>
  )
}

export default Settings
