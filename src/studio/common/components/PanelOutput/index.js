// @flow
import React from 'react'
import css from './index.css'
import DraggableArea from '$studio/common/components/DraggableArea'

type Props = {
  type: string,
  onDragStart: Function,
  onDragEnd: Function,
}

type State = {
  isBeingDragged: boolean,
  ghostImageTop: number,
  ghostImageMove: {
    x: number, y: number,
  },
}

class PanelOutput extends React.Component {
  props: Props
  state: State
  container: HTMLDivElement

  constructor(props: Props) {
    super(props)

    this.state = {
      isBeingDragged: false,
      ghostImageTop: 0,
      ghostImageMove: {x: 0, y: 0},
    }
  }

  onDragStart = () => {
    this.setState(() => {
      const parentTop = this.container.offsetParent.getBoundingClientRect().top
      const top = this.container.getBoundingClientRect().top - parentTop
      return {
        isBeingDragged: true,
        ghostImageTop: top,
      }
    })
    this.props.onDragStart()
  }

  onDrag = (dx: number, dy: number) => {
    this.setState(() => ({
      ghostImageMove: {x: dx, y: dy},
    }))
  }

  onDragEnd = () => {
    this.setState(() => ({
      isBeingDragged: false,
      ghostImageMove: {x: 0, y: 0},
    }))
    this.props.onDragEnd()
  }

  _renderGhostImage() {
    const {ghostImageMove: {x, y}, ghostImageTop} = this.state
    const {type} = this.props
    const style = {
      transform: `translate3d(${x}px, ${y + ghostImageTop}px, 0)`,
    }
    return (
      <div className={css.ghostImage} style={style}>{type}</div>
    )
  }

  render() {
    const {type} = this.props
    const {isBeingDragged} = this.state
    return (
      <div ref={(div) => {this.container = div}} className={css.container}>
        <DraggableArea
          onDragStart={this.onDragStart}
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}>
          <div className={css.type}>{type}</div>
        </DraggableArea>
        {isBeingDragged && this._renderGhostImage()}
      </div>
    )
  }
}

export default PanelOutput