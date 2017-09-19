// @flow
import React from 'react'
import css from './TimelineContainer.css'

type Props = {
  name: string,
}

const TimelineContainer = (props: Props) => {
  return (
    <div className={css.container}>
      <div className={css.moveHandle}>
        {String.fromCharCode(0x21F5)}
      </div>
      {props.name}
    </div>
  )
}

export default TimelineContainer