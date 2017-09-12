// @flow
import * as React from 'react'
import cx from 'classnames'
import css from './index.css'

type Props = {
  type: string,
  isConnected: boolean,
  shouldAcceptDraggedOutput: boolean,
  setInput: Function,
}

type State = {
  isActive: boolean,
}

class PanelInput extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      isActive: false,
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (!newProps.shouldAcceptDraggedOutput && newProps.isConnected) {
      this.setState(() => ({
        isActive: false,
      }))
    }
  }

  onMouseEnter = () => {
    const {shouldAcceptDraggedOutput} = this.props
    if (shouldAcceptDraggedOutput) {
      this.setState(() => ({
        isActive: true,
      }))
    }
  }

  onMouseUp = () => {
    const {shouldAcceptDraggedOutput} = this.props
    if (shouldAcceptDraggedOutput) {
      this.props.setInput()
    }
  }

  onMouseLeave = () => {
    const {shouldAcceptDraggedOutput} = this.props
    if (shouldAcceptDraggedOutput) {
      this.setState(() => ({
        isActive: false,
      }))
    }
  }

  render() {
    const {type, isConnected, shouldAcceptDraggedOutput} = this.props
    const {isActive} = this.state
    const classes = cx(css.container,{
      [css.highlight]: shouldAcceptDraggedOutput,
      [css.active]: isActive,
    })
    return (
      <div
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseUp={this.onMouseUp}
        className={classes}>
        {isActive
          ?
          <div className={css.dropHint}>Drop the output to connect to</div>
          :
          <div>
            <div className={css.type}>{type}</div>
            <div className={css.hint}>
              {isConnected ? 'Connected' : 'Drop an output'}
            </div>
          </div>
        }
      </div>
    )
  }
}

export default PanelInput
