// @flow
import {React, connect} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'
import ContextMenu from './ContextMenu'
import AddBar from './AddBar'
import NodeContent from './NodeContent'
import cx from 'classnames'

type OwnProps = {
  descriptor: Object,
  rootPath: string[],
  parentPath: string[],
  getLocalHiddenValue: Function,
  addToRefMap: Function,
  moveNode: Function,
  deleteNode: Function,
  addChildToNode: Function,
  updateTextNodeContent: Function,
  depth?: number,
  isANodeBeingDragged: boolean,
  setActiveDropZone: Function,
  unsetActiveDropZone: Function,
  setNodeBeingDragged: Function,
}

type Props = OwnProps & {
  getComponentDescriptor: Function,
  dispatch: Function,
}

type State = {
  isAddingNewChild: boolean,
  isContextMenuVisible: boolean,
  newChildIndex: ?number,
  isBeingDragged: boolean,
}

class RenderTreeNode extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      isAddingNewChild: false,
      isContextMenuVisible: false,
      newChildIndex: null,
      isBeingDragged: false,
      height: 0,
      top: 0,
    }
  }

  componentDidMount() {
    if (this.props.isANodeBeingDragged) {
      this.setState(() => ({isExpanding: true, height: this.container.scrollHeight + 30}))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isExpanding && !nextProps.isANodeBeingDragged) {
      setTimeout(() => {
        this.container.style.maxHeight = 'auto'
        this.setState(() => ({isExpanding: false, height: 0}))
      }, 500)
    }

    if (!nextProps.isCommandPressed && !this.state.isAddingNewChild) {
      this.setState(() => ({newChildIndex: null}))
    }

    if (!nextProps.isANodeBeingDragged && this.state.isBeingDragged) {
      this.setState(() => ({isBeingDragged: false}))
    }
  }

  _getNodeContentAndChildren(descriptor) {
    const {getLocalHiddenValue, getComponentDescriptor} = this.props
    const {__descriptorType: descriptorType, which} = descriptor

    let nodeId
    let nodeType
    let nodePath
    let nodeContent
    let nodeChildren = []
    if (descriptorType != null) {
      nodeType = 'tag'
      let renderValue
      if (descriptorType === 'ReferenceToLocalHiddenValue') {
        nodePath = this.props.rootPath.concat('localHiddenValuesById', which)
        nodeId = which
        renderValue = getLocalHiddenValue(which)
      }
      if (descriptorType === 'ComponentInstantiationValueDescriptor') {
        nodePath = this.props.rootPath
        nodeId = descriptor.props.key
        renderValue = descriptor
      }
      if (
        renderValue &&
        renderValue.__descriptorType === 'ComponentInstantiationValueDescriptor'
      ) {
        nodeChildren = [].concat(renderValue.props.children)
        nodeContent = getComponentDescriptor(renderValue.componentId).displayName
      }
    } else {
      nodeType = 'text'
      nodeContent = descriptor
    }

    return {nodeId, nodeType, nodeContent, nodeChildren, nodePath}
  }

  contextMenuHandler = e => {
    e.preventDefault()
    this._toggleContextMenu()
  }

  _toggleContextMenu() {
    this.setState(state => ({
      isContextMenuVisible: !state.isContextMenuVisible,
    }))
  }

  _moveNode = (id, dir) => {
    this.props.moveNode(id, dir)
    this._toggleContextMenu()
  }

  _deleteNode = id => {
    this.props.deleteNode(id)
    this._toggleContextMenu()
  }

  _addChildToNode = nodeId => {
    this.setState(state => {
      if (state.newChildIndex == null) return state
      this.props.addChildToNode(nodeId, state.newChildIndex)
      return {
        isAddingNewChild: false,
        newChildIndex: null,
      }
    })
  }

  resetNewChildIndex = () => {
    if (this.state.isAddingNewChild) return
    this.props.unsetActiveDropZone()
    this.setState(() => ({newChildIndex: null}))
  }

  mouseEnterHandler = e => {
    e.stopPropagation()
    if (this.props.onMouseEnter) this.props.onMouseEnter()
  }

  mouseMoveHandler = (e, newChildIndex, nodeId) => {
    e.stopPropagation()
    if (this.state.newChildIndex === newChildIndex) return
    if (this.props.isANodeBeingDragged)
      this.props.setActiveDropZone(nodeId, newChildIndex, this.props.depth || 0)
    this.setState(() => ({newChildIndex}))
  }

  mouseDownHandler = (e, nodeId, nodePath, nodeContent) => {
    e.stopPropagation()
    if (!e.shiftKey) return
    const {setNodeBeingDragged, depth} = this.props
    const {top, height} = this.container.getBoundingClientRect()

    this.container.style.maxHeight = `${height}px`
    this.setState(() => ({isBeingDragged: true}))
    setNodeBeingDragged({
      nodeId,
      nodePath,
      nodeContent,
      top,
      height,
      offsetY: e.nativeEvent.offsetY,
      depth,
    })
  }

  render() {
    const {props, state} = this
    const {newChildIndex, isBeingDragged, height} = state
    const {
      descriptor,
      addToRefMap,
      getLocalHiddenValue,
      rootPath,
      moveNode,
      deleteNode,
      addChildToNode,
      updateTextNodeContent,
      isCommandPressed,
      isANodeBeingDragged,
      setNodeBeingDragged,
      setActiveDropZone,
      unsetActiveDropZone,
    } = props

    const {
      nodeId,
      nodeType,
      nodeContent,
      nodeChildren,
      nodePath,
    } = this._getNodeContentAndChildren(descriptor)

    const depth = props.depth || 0

    if (nodeId != null) {
      addToRefMap(nodeId, {noOfChildren: nodeChildren.length})
      nodeChildren.forEach((child, index) => {
        if (
          child.__descriptorType != null &&
          child.__descriptorType === 'ReferenceToLocalHiddenValue'
        ) {
          addToRefMap(child.which, {parent: nodeId, index})
        }
      })
    }

    const acceptsChild = nodeType === 'tag' && typeof nodeChildren[0] !== 'string'
    const isDraggable = depth > 0

    return (
      <div
        className={cx(css.container, {
          [css.collapsed]: isBeingDragged && isANodeBeingDragged,
          [css.isExpanding]: this.state.isExpanding,
          [css.notRoot]: depth > 0,
        })}
        ref={c => (this.container = c)}
        style={{
          '--depth': depth,
          '--maxHeight': height > 0 ? height : 'auto',
        }}
      >
        <div
          className={css.contentContainer}
          onMouseEnter={this.mouseEnterHandler}
          onMouseMove={e => this.mouseMoveHandler(e, 0, nodeId)}
          onMouseLeave={this.resetNewChildIndex}
          {...(isDraggable
            ? {
                onMouseDown: e => this.mouseDownHandler(e, nodeId, nodePath, nodeContent),
              }
            : {})}
        >
          <div
            // {...(nodePath != null
            //   ? {
            //       onClick: () =>
            //         dispatch(
            //           reduceStateAction(
            //             ['x2', 'pathToInspectableInX2'],
            //             () => nodePath,
            //           ),
            //         ),
            //     }
            //   : {})}
            className={css.content}
            // onContextMenu={this.contextMenuHandler}
          >
            <NodeContent
              type={nodeType}
              content={nodeContent}
              nodePath={nodePath}
              ignoreClick={isCommandPressed}
              updateText={text =>
                updateTextNodeContent(this.props.parentPath.slice(-1)[0], text)
              }
            />
          </div>
          <AddBar
            shouldRenderNodePlaceholder={
              isCommandPressed && acceptsChild && newChildIndex === 0
            }
            shouldRenderDropZone={
              isANodeBeingDragged && acceptsChild && newChildIndex === 0
            }
            depth={depth + 1}
            onAnimationStart={() => this.setState(() => ({isAddingNewChild: true}))}
            onClick={() => this._addChildToNode(nodeId)}
          />
        </div>
        {nodeId &&
          this.state.isContextMenuVisible && (
            <ContextMenu
              {...(depth !== 0 ? {onDelete: () => this._deleteNode(nodeId)} : {})}
              depth={depth}
            />
          )}
        {nodeChildren.length > 0 &&
          nodeChildren.map((descriptor, i) => {
            const key = descriptor.which ? descriptor.which : i
            return (
              <div
                key={key}
                className={css.childContainer}
                onMouseEnter={this.mouseEnterHandler}
                onMouseMove={e => this.mouseMoveHandler(e, i + 1, nodeId)}
                onMouseLeave={this.resetNewChildIndex}
              >
                <WrappedRenderTreeNode
                  descriptor={descriptor}
                  depth={depth + 1}
                  rootPath={rootPath}
                  parentPath={nodePath}
                  getLocalHiddenValue={getLocalHiddenValue}
                  addToRefMap={addToRefMap}
                  moveNode={moveNode}
                  deleteNode={deleteNode}
                  addChildToNode={addChildToNode}
                  updateTextNodeContent={updateTextNodeContent}
                  onMouseEnter={this.resetNewChildIndex}
                  isCommandPressed={isCommandPressed}
                  isANodeBeingDragged={isANodeBeingDragged}
                  setNodeBeingDragged={setNodeBeingDragged}
                  setActiveDropZone={setActiveDropZone}
                  unsetActiveDropZone={unsetActiveDropZone}
                  parentSetHeight={this.setHeight}
                />
                <AddBar
                  shouldRenderNodePlaceholder={
                    isCommandPressed && acceptsChild && newChildIndex === i + 1
                  }
                  shouldRenderDropZone={
                    isANodeBeingDragged && acceptsChild && newChildIndex === i + 1
                  }
                  depth={depth + 1}
                  onAnimationStart={() => this.setState(() => ({isAddingNewChild: true}))}
                  onClick={() => this._addChildToNode(nodeId)}
                />
              </div>
            )
          })}
      </div>
    )
  }
}

const WrappedRenderTreeNode = connect(s => {
  return {
    getComponentDescriptor: id => getComponentDescriptor(s, id),
  }
})(RenderTreeNode)

export default WrappedRenderTreeNode
