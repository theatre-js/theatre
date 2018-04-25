import React from 'react'
import * as css from './index.css'

type Props = {
  k: React.ReactNode
  v: React.ReactNode
}

const KeyValuePair = (props: Props) => {
  return (
    <div key="container" className={css.container}>
      <div className={css.keyContainer}>{props.k}</div>
      <div className={css.colon}>:</div>
      <div className={css.valueContainer}>{props.v}</div>
    </div>
  )
}

export default KeyValuePair
