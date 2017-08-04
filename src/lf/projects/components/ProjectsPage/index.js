// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$lf/types'
import {withRunSaga, type WithRunSagaProps} from '$src/shared/utils'
import ProjectsList from './ProjectsList'
import css from './index.css'

type Props = WithRunSagaProps & {
  projects: Object,
}

const ProjectsPage = (props: Props) => {
  return (
    <div className={css.container}>
      <ProjectsList projects={props.projects} />
    </div>
  )
}

export default compose(
  connect(
    (state: StoreState) => {
      return {
        projects: state.mirrorOfLBState
          && state.mirrorOfLBState.projects
          && state.mirrorOfLBState.projects,
      }
    }
  ),
  withRunSaga(),
)(ProjectsPage)
