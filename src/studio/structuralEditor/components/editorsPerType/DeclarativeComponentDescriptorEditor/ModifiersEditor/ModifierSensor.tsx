import {React} from '$studio/handy'
import css from './ModifierSensor.css'
import cx from 'classnames'
import {MODE_CMD} from '$studio/workspace/components/StudioUI/StudioUI'

interface IProps {
  activeMode: string
  index: number
  isABoxBeingDragged: boolean
  onClick: Function
  onDrop: Function
}
interface IState {}

class ModifierSensor extends React.PureComponent<IProps, IState> {
  clickHandler = () => {
    if (this.props.activeMode !== MODE_CMD) return
    this.props.onClick(this.props.index)
  }

  mouseUpHandler = () => {
    if (this.props.isABoxBeingDragged) this.props.onDrop(this.props.index)
  }

  render() {
    const {activeMode, isABoxBeingDragged} = this.props
    const isCommandDown = activeMode === MODE_CMD
    return (
      <div
        className={cx(css.container, {
          [css.isCommandDown]: isCommandDown,
          [css.isABoxBeingDragged]: isABoxBeingDragged,
        })}
        onClick={this.clickHandler}
        onMouseUp={this.mouseUpHandler}
      />
    )
  }
}

export default ModifierSensor
