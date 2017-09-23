// @flow
import React from 'react'
import css from './LaneViewer.css'

type Props = {
  lanes: $FlowFixMe,
  splitLane: Function,
}

const LaneViewer = (props: Props) => {
  const {lanes, splitLane} = props
  return (
    <div className={css.container}>
      {lanes.length === 1
        ?
        <div>{lanes[0].name}</div>
        :
        lanes.map(({id, name}) => (
          <div
            key={id}
            onClick={() => splitLane(id)}
            className={css.split}>
            {name}
          </div>
        ))
      }
    </div>
  )
}

export default LaneViewer