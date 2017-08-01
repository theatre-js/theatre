// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './ProjectItem.css'

type Props = {
  project: Object,
  onClick: Function,
}

const ProjectItem = (props: Props) => {
  return (
    <div className={css.container}>
      <div className={css.name}>{props.project.bar}</div>
      <button className={css.forgetButton} onClick={props.onClick}>forget</button>
    </div>
  )
}

export default compose(
  (a) => a
)(ProjectItem)