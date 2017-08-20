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
  move: XY,
  resize: XY,
  moveBoundaries: Boundary,
  resizeBoundaries: Boundary,
}

class Panel extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
    
    const initialPos = {x: 10, y: 10}
    const initialDim = {x: 30, y: 30}
    const initialBoundaries = this.calculatePanelBoundaries(initialPos, initialDim)
    this.state = {
      isInSettings: false,
      pos: initialPos,
      dim: initialDim,
      move: {x: 0, y: 0},
      resize: {x: 0, y: 0},
      ...initialBoundaries,
    }
  }

  toggleSettings = () => {
    this.setState((state) => ({isInSettings: !state.isInSettings}))
  }

  movePanel = (dx: number, dy: number) => {
    this.setState((state) => {
      const {moveBoundaries: {xlow, xhigh, ylow, yhigh}} = state
      return {
        move: {
          x: _.clamp(dx, xlow, xhigh),
          y: _.clamp(dy, ylow, yhigh),
        }}
    })
  }

  setPanelPosition = () => {
    this.setState((state) => {
      const {pos, dim, move} = state
      const newPos = {
        x: pos.x + move.x / window.innerWidth * 100,
        y: pos.y + move.y / window.innerHeight * 100,
      }
      const newBoundaries = this.calculatePanelBoundaries(newPos, dim)
      return {
        pos: newPos,
        move: {x: 0, y: 0},
        ...newBoundaries,
      }
    })
  }

  calculatePanelBoundaries(pos: XY, dim: XY): {moveBoundaries: Boundary, resizeBoundaries: Boundary}
  { 
    const distanceToRight = 100 - pos.x - dim.x
    const distanceToBottom = 100 - pos.y - dim.y
    return {
      moveBoundaries: {
        xlow: - pos.x * window.innerWidth / 100,
        xhigh: distanceToRight * window.innerWidth / 100,
        ylow: - pos.y * window.innerHeight / 100,
        yhigh: distanceToBottom * window.innerHeight / 100,
      },
      resizeBoundaries: {
        xlow: - (dim.x - 10),
        xhigh: distanceToRight,
        ylow: - (dim.y - 10),
        yhigh: distanceToBottom,
      },
    }
  }

  resizePanel = (dx: number, dy: number) => {
    this.setState((state) => {
      const {resizeBoundaries: {xlow, xhigh, ylow, yhigh}} = state
      return {
        resize: {
          x: _.clamp(dx / window.innerWidth * 100, xlow, xhigh),
          y: _.clamp(dy / window.innerHeight * 100, ylow, yhigh),
        },
      }
    })
  }

  setPanelSize = () => {
    this.setState((state) => {
      const {pos, dim, resize} = state
      const newDim = {
        x: dim.x + resize.x,
        y: dim.y + resize.y,
      }
      const newBoundaries = this.calculatePanelBoundaries(pos, newDim)
      return {
        dim: newDim,
        resize: {x: 0, y: 0},
        ...newBoundaries,
      }
    })
  }

  render() {
    const {children} = this.props
    const {isInSettings, pos, dim, move, resize} = this.state
    const style = {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      width: `${dim.x + resize.x}%`,
      height: `${dim.y + resize.y}%`,
      transform: `translate3d(${move.x}px, ${move.y}px, 0)`,
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
              onPanelDragEnd={this.setPanelPosition}
              onPanelResize={this.resizePanel}
              onPanelResizeEnd={this.setPanelSize}/>
            :
            children}
        </div>
      </div>
    )
  }
}

export default Panel