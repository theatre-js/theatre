// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {connect} from '$lf/utils'
import {type StoreState} from '$lf/types'
import ProjectsList from './ProjectsList'
import css from './index.css'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import isPathAProject from '$lb/projects/lfEndpoints/isPathAProject.caller'
import createNewProject from '$lb/projects/lfEndpoints/createNewProject.caller'
import recogniseProject from '$lb/projects/lfEndpoints/recogniseProject.caller'
import unrecogniseProject from '$lb/projects/lfEndpoints/unrecogniseProject.caller'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import ErrorLogger from '$lf/common/components/ErrorLogger'
import errorMessages from '$lf/projects/errors'

type Props = WithRunSagaProps & {
  projects: Object,
}

type State = {
  isCreatingNewProject: boolean,
  isDropzoneActive: boolean,
  lastDroppedPath: undefined | null | string,
  error: undefined | null | string,
}

class ProjectsPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isCreatingNewProject: false,
      isDropzoneActive: false,
      lastDroppedPath: null,
      error: null,
    }
  }

  activateDropzone() {
    this.setState(() => ({
      isCreatingNewProject: false,
      isDropzoneActive: true,
      error: null,
    }))
  }

  cancelCreatingProject = () => {
    this.setState(() => ({
      isCreatingNewProject: false,
      lastDroppedPath: null,
    }))
  }

  clearError = () => {
    this.setState(() => ({
      error: null,
    }))
  }

  dragStartHandler = () => {
    this.activateDropzone()
  }

  dragEnterHandler = () => {
    this.activateDropzone()
  }

  dragLeaveHandler = () => {
    this.setState(() => ({
      isDropzoneActive: false,
    }))
  }

  dragOverHandler = (e: SyntheticDragEvent<>) => {
    e.preventDefault()
  }

  dropHandler = (e: SyntheticDragEvent<>) => {
    e.preventDefault()
    const path = e.dataTransfer.files[0].path
    this.setState(() => ({
      isDropzoneActive: false,
      lastDroppedPath: path,
    }))
    this.addOrRecogniseProject(path)
  }

  async addOrRecogniseProject(path: string) {
    const isProjectResult = await this.props.runSaga(isPathAProject, {
      fileOrFolderPath: path,
    })
    if (isProjectResult.type === 'ok') {
      if (isProjectResult.isIt) {
        const recogniseResult = await this.props.runSaga(recogniseProject, {
          filePath: isProjectResult.filePath,
        })
        if (recogniseResult.type === 'error') {
          this.setState(() => ({
            error: errorMessages[recogniseResult.errorType],
          }))
        }
      } else {
        this.setState(() => ({
          isCreatingNewProject: true,
        }))
      }
    }
    if (isProjectResult.type === 'error') {
      this.setState(() => ({
        error: isProjectResult.message,
      }))
    }
  }

  async createProject(name: string) {
    if (this.state.lastDroppedPath != null) {
      const folderPath: string = this.state.lastDroppedPath
      const createResult = await this.props.runSaga(createNewProject, {
        folderPath,
        name,
      })
      this.setState(() => ({
        isCreatingNewProject: false,
      }))
      if (createResult.type === 'error') {
        this.setState(() => ({
          error: errorMessages[createResult.errorType],
        }))
      }
    }
  }

  async forgetProject(path: string) {
    const unrecogniseResult = await this.props.runSaga(unrecogniseProject, {
      filePath: path,
    })
    if (unrecogniseResult.type === 'error') {
      this.setState(() => ({
        error: errorMessages[unrecogniseResult.errorType],
      }))
    }
  }

  render() {
    const {error} = this.state
    return (
      <div className={css.container}>
        <div className={css.title}>Projects</div>
        <div
          className={
            this.state.isDropzoneActive ? css.activeDropzone : css.dropzone
          }
          onDragStart={this.dragStartHandler}
          onDragEnter={this.dragEnterHandler}
          onDragLeave={this.dragLeaveHandler}
          onDragOver={this.dragOverHandler}
          onDrop={this.dropHandler}
        >
          <ProjectsList
            projects={this.props.projects}
            forgetHandler={path => this.forgetProject(path)}
          />
          {this.state.isCreatingNewProject && (
            <div className={css.nameInput}>
              <SingleInputForm
                placeholder="Project name (return to add/esc to cancel)"
                onSubmit={value => {
                  this.createProject(value)
                }}
                onCancel={this.cancelCreatingProject}
              />
            </div>
          )}
        </div>
        {error != null ? (
          <div className={css.error}>
            <ErrorLogger closeHandler={this.clearError}>{error}</ErrorLogger>
          </div>
        ) : (
          <div className={css.dropHint}>
            Drop a Folder/File to Create/Add a new Project.
          </div>
        )}
      </div>
    )
  }
}

export default compose(
  connect((state: StoreState) => {
    return {
      projects:
        state.mirrorOfLBState &&
        state.mirrorOfLBState.projects &&
        state.mirrorOfLBState.projects,
    }
  }),
  withRunSaga(),
)(ProjectsPage)
