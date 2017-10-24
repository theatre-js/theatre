// @flow
import React from 'react'
import css from './index.css'

type Props = {
  inputs: {
    selectedNode: Object,
  },
}

const Content = (props: Props) => {
  const {inputs: {selectedNode}} = props
  return (
    <div className={css.container}>
      {selectedNode
        ?
        <div className={css.name}>{selectedNode.data.name}</div>
        : 
        <div className={css.noElement}>No element selected</div>
      }
    </div>
  )
}

export default Content