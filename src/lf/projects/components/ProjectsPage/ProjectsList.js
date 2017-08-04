// @flow
import React from 'react'
import css from './ProjectsList.css'
import Dropzone from '$lf/common/components/Dropzone'
import ProjectItem from './ProjectItem'

type Props = {
  projects: Object,
}
type State = {
  isDropzoneActive: boolean,
  error: ?string,
}

class ProjectsList extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isDropzoneActive: false,
      error: null,
    }
  }

  setDropzoneActiveStateTo(newState: boolean) {
    this.setState(() => ({isDropzoneActive: newState}))
  }

  setErrorStateTo(message: string | null) {
    this.setState(() => ({error: message}))
  }

  dragStartHandler = () => {
    this.setDropzoneActiveStateTo(true)
    this.setErrorStateTo(null)
  }

  dragEnterHandler = () => {
    this.setDropzoneActiveStateTo(true)
    this.setErrorStateTo(null)
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
      console.log('is Dir')
    } else {
      this.setErrorStateTo('Not a Folder!')
    }
  }

  render() {
    console.log(this.state.isDropzoneActive)
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
        </Dropzone>
        {
          (this.state.error !== null) ?
            <div className={css.error}>{this.state.error}</div>
            :
            <div className={css.dropGuide}>Drop a Folder to Add/Create a new Project.</div>
        }
      </div>
    )
  }
}

export default ProjectsList
