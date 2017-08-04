// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$lf/types'
import css from './index.css'
import FolderDropzone from './FolderDropzone'
import ProjectItem from './ProjectItem'
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
      <h3 className={css.title}>Projects</h3>
      <FolderDropzone css={css.dropzone} activeCss={css.activeDropzone}>
        {
          Object.entries(props.projects).map(([key, value]) => {
            return <ProjectItem key={key} project={value} onForget={() => {}}/>
          })
        }
      </FolderDropzone>
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
  )
)(ProjectsPage)
