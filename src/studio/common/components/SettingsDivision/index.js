// @flow
import React from 'react'
import css from './index.css'

type Props = {
  title: string,
  children: Object,
}

const SettingsDivision = (props: Props) => {
  return (
    <div className={css.container}>
      <div className={css.title}>{props.title}</div>
      <div className={css.children}>{props.children}</div>
    </div>
  )
}

export default SettingsDivision