import React from 'react'
import css from './ModifierSensor.css'
import cx from 'classnames'
import {MODES} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'

interface IProps {
  activeMode: string
  index: number
  translateY: number
  isABoxBeingDragged: boolean
  onClick: (index: number) => void
  onDrop: (index: number, top: number) => void
}
interface IState {}

class ModifierSensor extends React.PureComponent<IProps, IState> {
  container: HTMLDivElement | null
  clickHandler = () => {
    if (this.props.activeMode !== MODES.cmd) return
    this.props.onClick(this.props.index)
  }

  mouseUpHandler = () => {
    if (this.props.isABoxBeingDragged) {
      const {bottom} = this.container!.getBoundingClientRect()
      this.props.onDrop(this.props.index, bottom)
    }
  }

  render() {
    const {activeMode, isABoxBeingDragged, translateY} = this.props
    const isCommandDown = activeMode === MODES.cmd
    const style = {
      transform: `translate3d(0, ${translateY}px, 0)`,
      transition: 'all .2s ease-in-out',
    }
    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.container, {
          [css.isCommandDown]: isCommandDown,
          [css.isABoxBeingDragged]: isABoxBeingDragged,
        })}
        style={style}
        onClick={this.clickHandler}
        onMouseUp={this.mouseUpHandler}
      />
    )
  }
}

export default ModifierSensor
