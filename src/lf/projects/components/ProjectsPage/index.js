// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$lf/types'
import ProjectsList from './ProjectsList'
import css from './index.css'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import isPathAProject from '$lb/projects/lfEndpoints/isPathAProject.caller'

type Props = WithRunSagaProps & {
  projects: Object,
}

const ProjectsPage = (props: Props) => {
  props.runSaga(isPathAProject, {fileOrFolderPath: '/foo/bar'}).then((result) => {
    console.log('result', result)
  })

  return (
    <div className={css.container}>
      <ProjectsList projects={props.projects} />
    </div>
  )
}

export default compose(
  withRunSaga(),
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
