import React from 'react'
import css from './SceneName.css'
import resolveCss from '$shared/utils/resolveCss'
import SceneSelector from '$studio/workspace/components/WhatToShowInBody/Viewports/SceneSelector'

const classes = resolveCss(css)

interface IProps {
  name: string
  viewportId: string
}

interface IState {
  isEditing: boolean
}

class SceneName extends React.PureComponent<IProps, IState> {
  state = {
    isEditing: false,
  }

  enableEditing = () => {
    this.setState(() => ({isEditing: true}))
  }

  disableEditing = () => {
    this.setState(() => ({isEditing: false}))
  }

  render() {
    const {isEditing} = this.state
    const {name} = this.props
    return (
      <div
        {...classes('container', isEditing && 'isEnabled')}
        onClick={this.enableEditing}
      >
        {isEditing ? (
          <SceneSelector
            viewportId={this.props.viewportId}
            onSelect={this.disableEditing}
            onCancel={this.disableEditing}
          />
        ) : (
          <span {...classes('name')}>{name}</span>
        )}
      </div>
    )
  }
}

export default SceneName
