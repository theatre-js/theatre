// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './index.css'

type Props = {}

const ProjectsPage = (props: Props) => {
  return (
    <div className={css.container}>projects page</div>
  )
}

export default compose(
  (a) => a
)(ProjectsPage)