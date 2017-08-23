// @flow
import React from 'react'
import css from './Settings.css'
import DraggableArea from '$studio/common/components/DraggableArea'
import panelTypes from '$studio/workspace/panelTypes'
import Select from '$studio/common/components/Select'
import _ from 'lodash'

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
      <Select
        label='Panel Type'
        options={_.map(panelTypes, (value, key) => ({value: key, label: value.label}))}
        onChange={(e) => console.log(e.target.value)}/>
      <DraggableArea
        onDrag={(dx, dy) => props.onPanelResize(dx, dy)}
        onDragEnd={() => props.onPanelResizeEnd()}>
        <div className={css.resizeHandler} title={'Resize Panel'} />
      </DraggableArea>
    </div>
  )
}

export default Settings