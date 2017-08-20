// @flow
import React from 'react'
import css from './Settings.css'
import DraggableArea from '$studio/common/components/DraggableArea'

type Props = {
  onPanelDrag: Function,
  onPanelDragEnd: Function,
  onPanelResize: Function,
  onPanelResizeEnd: Function,
}

const Settings = (props: Props) => {
  return (
    <div>
      <DraggableArea
        onDrag={(dx, dy) => props.onPanelDrag(dx, dy)}
        onDragEnd={() => props.onPanelDragEnd()}>
        <div className={css.dragHandler}>Move Panel</div>
      </DraggableArea>
      <DraggableArea
        onDrag={(dx, dy) => props.onPanelResize(dx, dy)}
        onDragEnd={() => props.onPanelResizeEnd()}>
        <div className={css.resizeHandler} title={'Resize Panel'} />
      </DraggableArea>
    </div>
  )
}

export default Settings