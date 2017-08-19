// @flow
import React from 'react'
import css from './Panel.css'
import Settings from './Settings'

type Props = {
  children: any,
}

type State = {
  isInSettings: boolean,
  pos: {x: number, y: number},
  dim: {x: number, y: number},
  transform: {x: number, y: number},
}

class Panel extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      isInSettings: false,
      pos: {x: 10, y: 10},
      dim: {x: 30, y: 30},
      transform: {x: 0, y: 0},
    }
  }

  toggleSettings = () => {
    this.setState((state) => ({isInSettings: !state.isInSettings}))
  }

  movePanel = (dx: number, dy: number) => {
    this.setState(() => ({
      transform: {x: dx, y: dy},
    }))
  }

  repositionPanel = () => {
    const {pos, transform} = this.state
    const newPos = {
      x: pos.x + transform.x/window.innerWidth*100,
      y: pos.y + transform.y/window.innerHeight*100,
    }
  
    this.setState(() => ({
      pos: newPos,
      transform: {x: 0, y: 0},
    }))
  }

  render() {
    const {children} = this.props
    const {isInSettings, pos, dim, transform} = this.state
    const style = {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      width: `${dim.x}%`,
      height: `${dim.y}%`,
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }

    return (
      <div className={css.container} style={style}>
        <div className={css.topBar}>
          <div
            className={css.settings}
            onClick={this.toggleSettings}>
            {isInSettings ? 'Confirm Settings' : 'Show Settings'}
          </div>
        </div>
        <div className={css.content}>
          {isInSettings
            ?
            <Settings
              onPanelDrag={this.movePanel}
              onPanelDragEnd={this.repositionPanel}/>
            :
            children}
        </div>
      </div>
    )
  }
}

export default Panel