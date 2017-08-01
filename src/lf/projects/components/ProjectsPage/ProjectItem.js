// @flow
import React from 'react'
import compose from 'ramda/src/compose'

type Props = {
  project: Object,
}

const ProjectItem = (props: Props) => {
  return (
    <div>{props.project.bar}</div>
  )
}

export default compose(
  (a) => a
)(ProjectItem)