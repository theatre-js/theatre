// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$lf/types'
import {withRunSaga, type WithRunSagaProps} from '$src/shared/utils'
import {isPathAProject, recogniseProject, createNewProject, unrecognizeProject} from '$lf/projects/sagas'
import css from './index.css'
import FolderDropzone from './FolderDropzone'
import ProjectItem from './ProjectItem'

type Props = WithRunSagaProps & {
  projects: Object,
}

type State = {}

class ProjectsPage extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async handleDrop(path) {
    const isProject = await this.props.runSaga(isPathAProject, {path})
    if (isProject) {
      try {
        await this.props.runSage(recogniseProject, {path})
      } catch (error) {
        console.log(error.message)
      }
    } else {
      try {
        await this.props.runSaga(createNewProject, {path, name: `test-${Date.now()}`})
      } catch (error) {
        console.log(error.message)
      }
    }
  }

  async handleForgetProject(path) {
    try {
      await this.props.runSaga(unrecognizeProject, {path})
    } catch (error) {
      console.log(error.message)
    }
  }

  render() {
    return (
      <div className={css.container}>
        <h3 className={css.title}>Projects</h3>
        <FolderDropzone
          css={css.dropzone}
          activeCss={css.activeDropzone}
          onDropHandler={(path) => this.handleDrop(path)}>
          {
            Object.entries(this.props.projects).map(([key, value]) => {
              return (
                <ProjectItem
                  key={key}
                  project={value}
                  onForget={() => this.handleForgetProject(value.path)}/>
              )
            })
          }
        </FolderDropzone>
        <div className={css.dropGuide}>Drop a Folder to Add/Create a Project.</div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: StoreState) => {
      return {
        projects: state.mirrorOfLBState
          && state.mirrorOfLBState.projects
          && state.mirrorOfLBState.projects
      }
    }
  ),
  withRunSaga(),
)(ProjectsPage)
