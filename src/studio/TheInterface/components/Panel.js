// @flow
import React from 'react'
import css from './Panel.css'
import Settings from './Settings'
import _ from 'lodash'

type Props = {
  children: any,
}

type XY = {x: number, y: number}
type Boundary = {xlow: number, xhigh: number, ylow: number, yhigh: number}

type State = {
  isInSettings: boolean,
  pos: XY,
  dim: XY,
  transform: XY,
  boundaries: Boundary,
}

class Panel extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    
    const initialPos = {x: 10, y: 10}
    const initialDim = {x: 30, y: 30}
    const initialTransform = {x: 0, y: 0}
    this.state = {
      isInSettings: false,
      pos: initialPos,
      dim: initialDim,
      transform: initialTransform,
      boundaries: this.calculatePanelBoundaries(initialPos, initialDim),
    }
  }

  toggleSettings = () => {
    this.setState((state) => ({isInSettings: !state.isInSettings}))
  }

  movePanel = (dx: number, dy: number) => {
    const {boundaries: {xlow, xhigh, ylow, yhigh}} = this.state
    this.setState(() => ({
      transform: {
        x: _.clamp(dx, xlow, xhigh),
        y: _.clamp(dy, ylow, yhigh),
      },
    }))
  }

  repositionPanel = () => {
    const {pos, transform} = this.state
    const newPos = {
      x: pos.x + transform.x / window.innerWidth * 100,
      y: pos.y + transform.y / window.innerHeight * 100,
    }

    this.setState(() => ({
      pos: newPos,
      transform: {x: 0, y: 0},
    }))
  }

  calculatePanelBoundaries(
    pos: XY = this.state.pos,
    dim: XY = this.state.dim,): Boundary
  { 
    return {
      xlow: - pos.x * window.innerWidth / 100,
      xhigh: (100 - pos.x - dim.x) * window.innerWidth / 100,
      ylow: - pos.y * window.innerHeight / 100,
      yhigh: (100 - pos.y - dim.y) * window.innerHeight / 100,
    }
  }

  resetPanelBoundaries = () => {
    const boundaries = this.calculatePanelBoundaries()
    this.setState(() => ({boundaries}))
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
              onPanelDragEnd={this.repositionPanel}
              onPanelDragStart={this.resetPanelBoundaries}/>
            :
            children}
        </div>
      </div>
    )
  }
}

export default Panel