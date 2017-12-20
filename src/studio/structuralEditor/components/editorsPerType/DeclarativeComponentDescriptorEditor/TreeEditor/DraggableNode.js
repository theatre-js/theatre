// @flow
import {React} from '$studio/handy'
import css from './DraggableNode.css'
import rcss from './RenderTreeNode.css'
import RenderTreeNode from './RenderTreeNode'
import NodeContent from './NodeContent'

type Props = any

type State = void

class DraggableNode extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      moveY: 0,
      isDragging: false,
      offsetTop: props.nodeProps.top,
      depth: props.nodeProps.depth - 1,
    }
  }

  componentDidMount() {
    const {top: offsetTop} = this.container.getBoundingClientRect()
    this.setState(() => ({offsetTop}))
    this.addDragListeners()
  }

  componentWillUnmount() {
    this.removeDragListeners()
  }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragHandler = (e: MouseEvent) => {
    if (!this.state.isDragging) this.setState(() => ({isDragging: true}))
    const {top, clickOffsetY} = this.props.nodeProps
    // console.log(e.offsetY)
    this.setState(() => ({moveY: e.clientY - clickOffsetY - top}))
    // const {startPos} = this.state
    // this.props.onDrag &&
    // this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  dragEndHandler = () => {
    this.removeDragListeners()

    if (this.state.isDragging) {
      this.setState(() => ({isDragging: false, moveY: 0}))
    }
    this.props.onDrop()
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({depth: nextProps.depth}))
  }

  render() {
    const {moveY, offsetTop, depth} = this.state
    const {getLocalHiddenValue, nodeProps} = this.props
    const {id: nodeId, path: nodePath, content: nodeContent, top, height} = nodeProps

    return (
      <div
        ref={c => (this.container = c)}
        className={css.staticContainer}
        style={{
          '--height': height,
          transform: `translate3d(0, ${top - offsetTop + moveY}px, 0)`,
        }}
      >
        <div className={css.dynamicContainer} style={{'--depth': depth}}>
          <div className={css.contentWrapper}>
            <NodeContent content={nodeContent} renderTags={false}/>
          </div>
          <div className={css.treeContainer}>
            <RenderTreeNode
              descriptor={getLocalHiddenValue(nodeId)}
              moveNode={() => {}}
              deleteNode={() => {}}
              addChildToNode={() => {}}
              updateTextNodeContent={() => {}}
              rootPath={nodePath}
              parentPath={nodePath}
              addToRefMap={() => {}}
              depth={depth + 1}
              getLocalHiddenValue={getLocalHiddenValue}
              isCommandPressed={false}
              isANodeBeingDragged={false}
              setNodeBeingDragged={() => {}}
              setActiveDropZone={() => {}}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default DraggableNode
