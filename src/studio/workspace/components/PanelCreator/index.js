// @flow
import React from 'react'
import panelTypes from '$studio/workspace/panelTypes'
import {type PanelPlacementSettings} from '$studio/workspace/types'
import _ from 'lodash'
import css from './index.css'

type Props = PanelPlacementSettings & {
  onCreatingPanel: Function,
  onCancel: Function,
}

const PanelCreator = ({onCreatingPanel, pos, dim, onCancel}: Props) => {
  const style = {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: `${dim.x}%`,
    height: `${dim.y}%`,
  }
  return (
    <div className={css.container} style={style}>
      <div className={css.topBar}>
        <div
          className={css.cancel}
          onClick={() => onCancel()}>Cancel</div>
      </div>
      <div className={css.title}>Choose type of the panel:</div>
      {
        _.map(panelTypes, (value, key) => (
          <div
            className={css.item}
            key={key}
            onClick={() => onCreatingPanel(key)}>
            {value.label}
          </div>
        ))
      }
    </div>
  )
}

export default PanelCreator