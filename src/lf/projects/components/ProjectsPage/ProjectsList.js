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
}

class ProjectsList extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isDropzoneActive: false,
    }
  }

  setDropzoneActiveStateTo(newState: boolean) {
    if (this.state.isDropzoneActive !== newState) {
      this.setState(() => ({isDropzoneActive: newState}))
    }
  }

  dragStartHandler = () => {
    this.setDropzoneActiveStateTo(true)
  }

  dragEnterHandler = () => {
    this.setDropzoneActiveStateTo(true)
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
      console.error('not a Dir')
    }
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
        </Dropzone>
        <div className={css.dropGuide}>Drop a folder to Add/Create a new Project.</div>
      </div>
    )
  }
}

export default ProjectsList
