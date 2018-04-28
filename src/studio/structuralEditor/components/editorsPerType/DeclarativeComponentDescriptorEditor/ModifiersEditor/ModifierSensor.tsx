import {React} from '$studio/handy'
import css from './ModifierSensor.css'
import cx from 'classnames'
import {MODE_CMD} from '$studio/workspace/components/StudioUI/StudioUI'

interface IProps {
  activeMode: string
  index: number
  translateY: number
  isABoxBeingDragged: boolean
  onClick: Function
  onDrop: (index: number, top: number) => void
}
interface IState {}

class ModifierSensor extends React.PureComponent<IProps, IState> {
  container: HTMLDivElement | null
  clickHandler = () => {
    if (this.props.activeMode !== MODE_CMD) return
    this.props.onClick(this.props.index)
  }

  mouseUpHandler = () => {
    // if (this.props.isABoxBeingDragged) {
    //   this.setState(() => ({drop: true}))
    // }
    if (this.props.isABoxBeingDragged) {
      const {bottom} = this.container!.getBoundingClientRect()
      this.props.onDrop(this.props.index, bottom)
    }
  }

  render() {
    const {activeMode, isABoxBeingDragged, translateY} = this.props
    const isCommandDown = activeMode === MODE_CMD
    const style = {
      transform: `translate3d(0, ${translateY}px, 0)`,
      transition: 'transform .2s ease-in-out',
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
