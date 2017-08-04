// @flow
import React from 'react'
import css from './ProjectsList.css'
import ProjectItem from './ProjectItem'
import Dropzone from '$lf/common/components/Dropzone'
import ErrorLogger from '$lf/common/components/ErrorLogger'
import SingleInputForm from '$lf/common/components/SingleInputForm'

type Props = {
  projects: Object,
}
type State = {
  isCreatingNewProject: boolean,
  newProjectPath: ?string,
  isDropzoneActive: boolean,
  error: ?string,
}

class ProjectsList extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isCreatingNewProject: false,
      newProjectPath: null,
      isDropzoneActive: false,
      error: null,
    }
  }

  setCreatingNewProjectStateTo(newState: boolean) {
    this.setState(() => ({isCreatingNewProject: newState}))
    if (!newState) {
      this.setNewProjectPathTo(null)
    }
  }

  setNewProjectPathTo(path: ?string) {
    this.setState(() => ({newProjectPath: path}))
  }

  setDropzoneActiveStateTo(newState: boolean) {
    this.setState(() => ({isDropzoneActive: newState}))
  }

  setErrorStateTo(message: ?string) {
    this.setState(() => ({error: message}))
  }

  prepareDropzoneOnDragStart() {
    this.setCreatingNewProjectStateTo(false)
    this.setDropzoneActiveStateTo(true)
    this.setErrorStateTo(null)
  }

  dragStartHandler = () => {
    this.prepareDropzoneOnDragStart()
  }

  dragEnterHandler = () => {
    this.prepareDropzoneOnDragStart()
  }

  dragLeaveHandler = () => {
    this.setDropzoneActiveStateTo(false)
  }

  dragOverHandler = (e: SyntheticDragEvent) => {
    e.preventDefault()
  }

  dropHandler = (e: SyntheticDragEvent) => {
    e.preventDefault()
    this.setDropzoneActiveStateTo(false)
    
    const entry : Object = e.dataTransfer.items[0].webkitGetAsEntry()
    if (entry.isDirectory) {
      const path = e.dataTransfer.files[0].path
      this.setNewProjectPathTo(path)
      this.setCreatingNewProjectStateTo(true)
    } else {
      this.setErrorStateTo('Not a Folder!')
    }
  }

  addNewProject = (projectName: string) => {
    this.setCreatingNewProjectStateTo(false)
    console.log(projectName, this.state.newProjectPath)
  }

  cancelAddingNewProject = () => {
    this.setCreatingNewProjectStateTo(false)
    this.setNewProjectPathTo(null)
  }

  render() {
    return (
      <div>
        <div className={css.title}>Projects</div>
        <Dropzone
          css={this.state.isDropzoneActive ? css.activeDropzone : css.dropzone}
          dragStartHandler={this.dragStartHandler}
          dragEnterHandler={this.dragEnterHandler}
          dragLeaveHandler={this.dragLeaveHandler}
          dragOverHandler={this.dragOverHandler}
          dropHandler={this.dropHandler}>
          {
            Object.entries(this.props.projects).map(([key, value]) => {
              return (
                <ProjectItem
                  key={key}
                  project={value}
                  onForget={() => {console.log('forget')}}/>
              )
            })
          }
          {this.state.isCreatingNewProject &&
            <SingleInputForm
              placeholder='Project name (return to add/esc to cancel)'
              onSubmit={this.addNewProject}
              onCancel={this.cancelAddingNewProject}/>
          }
        </Dropzone>
        {
          (this.state.error !== null) ?
            <div className={css.error}>
              <ErrorLogger closeHandler={() => this.setErrorStateTo(null)} >{this.state.error}</ErrorLogger>
            </div>
            :
            <div className={css.dropGuide}>Drop a Folder to Add/Create a new Project.</div>
        }
      </div>
    )
  }
}

export default ProjectsList
