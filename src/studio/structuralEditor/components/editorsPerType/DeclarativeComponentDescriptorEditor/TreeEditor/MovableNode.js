// @flow
import {React} from '$studio/handy'
import css from './MovableNode.css'
import cx from 'classnames'
import {NODE_TYPE} from './constants'
import {presentationOnlyComponent as ComponentNode} from './ComponentNode'
import {presentationOnlyComponent as TextNode} from './TextNode'

type Props = {
  nodeBeingDragged: Object,
  activeDropZone: Object,
  onCancel: Function,
}

type State = {
  offsetTop: number,
  isBeingDragged: boolean,
  isGlued: boolean,
  moveY: number,
}

class MovableNode extends React.Component<Props, State> {
  unglueTimeout = null
  state = {
    offsetTop: this.props.nodeBeingDragged.top,
    isBeingDragged: false,
    isGlued: true,
    moveY: 0,
  }

  componentDidMount() {
    const {top: offsetTop} = this.container.getBoundingClientRect()
    this.setState(() => ({offsetTop}))

    this.addListeners()
    this.unglueTimeout = setTimeout(() => {
      this.setState(() => ({isGlued: false}))
    }, 300)
  }

  componentWillUnmount() {
    clearTimeout(this.unglueTimeout)
    this.removeListeners()
  }

  addListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragHandler = (e: MouseEvent) => {
    if (!this.state.isBeingDragged) this.setState(() => ({isBeingDragged: true}))
    const {top, offsetY} = this.props.nodeBeingDragged
    this.setState(() => ({moveY: e.clientY - offsetY - top}))
  }

  dragEndHandler = () => {
    if (this.props.activeDropZone == null) this.props.onCancel()
  }

  render() {
    const {nodeBeingDragged, activeDropZone} = this.props
    const {nodeProps, top} = nodeBeingDragged
    const {offsetTop, moveY, isGlued} = this.state
    const depth = (activeDropZone && activeDropZone.depth) || nodeBeingDragged.depth

    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.staticContainer, {
          [css.isGlued]: isGlued,
        })}
        style={{
          ...(!isGlued ? {transform: `translateY(${moveY}px)`} : {}),
          top: `${top - offsetTop}px`,
        }}
        {...(isGlued ? {onMouseLeave: this.dragEndHandler} : {})}
      >
        <div className={css.dynamicContainer} style={{'--depth': depth}}>
          {nodeProps.type === NODE_TYPE.COMPONENT && <ComponentNode nodeProps={nodeProps} />}
          {nodeProps.type === NODE_TYPE.TEXT && <TextNode nodeProps={nodeProps}/>}
        </div>
      </div>
    )
  }
}

export default MovableNode
