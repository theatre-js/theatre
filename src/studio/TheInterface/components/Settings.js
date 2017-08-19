// @flow
import React from 'react'
import css from './Settings.css'
import DraggableArea from '$studio/common/components/DraggableArea'

type Props = {
  onPanelDrag: Function,
  onPanelDragEnd: Function,
}

const Settings = (props: Props) => {
  return (
    <DraggableArea
      onDragStart={() => console.log('drag start')}
      onDragEnd={() => props.onPanelDragEnd()}
      onDrag={(dx, dy) => props.onPanelDrag(dx, dy)}>
      <div className={css.dragHandler} />
    </DraggableArea>
  )
}

export default Settings