// @flow
import {React} from '$studio/handy'
import css from './MovableNode.css'
import PresentationOnlyNode from './PresentationOnlyNode'

type Props = {
  rootNode: Object
  nodeBeingDragged: Object
  onCancel: Function
}

type State = {
  offsetTop: number
  isBeingDragged: boolean
  moveY: number
}

class MovableNode extends React.PureComponent<Props, State> {
  state = {
    offsetTop: this.props.nodeBeingDragged.top,
    isBeingDragged: false,
    moveY: 0,
    moveX: 0,
  }

  componentDidMount() {
    const {top: offsetTop} = this.container.getBoundingClientRect()
    this.setState(() => ({offsetTop}))

    this.addListeners()
  }

  componentWillUnmount() {
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
    if (!this.state.isBeingDragged)
      this.setState(() => ({isBeingDragged: true}))
    const {top, offsetY, left, offsetX} = this.props.nodeBeingDragged
    this.setState(() => ({
      moveY: e.clientY - offsetY - top,
      moveX: e.clientX - offsetX - left,
    }))
  }

  dragEndHandler = () => {
    this.props.onDragEnd()
  }

  render() {
    const {nodeBeingDragged, rootNode} = this.props
    const {top, depth, height} = nodeBeingDragged
    const {offsetTop, moveY, moveX} = this.state
    return (
      <div
        ref={c => (this.container = c)}        
        className={css.container}
        style={{
          transform: `translate3d(${moveX}px, ${moveY}px, 0)`,
          top: `${top - offsetTop}`,
          '--depth': depth,
          '--height': height,
        }}
      >
        <PresentationOnlyNode nodeData={rootNode} rootNodeId={rootNode.id}/>
      </div>
    )
  }
}

export default MovableNode
