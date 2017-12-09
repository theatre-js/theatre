// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'
import ContextMenu from './ContextMenu'
import AddBar from './AddBar'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea'

type OwnProps = {
  descriptor: Object,
  rootPath: string[],
  parentPath: string[],
  getLocalHiddenValue: Function,
  addToRefMap: Function,
  moveNode: Function,
  deleteNode: Function,
  addChildToNode: Function,
  updateTextChildContent: Function,
  depth?: number,
  bringParentToFront?: Function,
  sendParentToBack?: Function,
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
  isInFront: boolean,
  moveY: number,
}

class RenderTreeNode extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      isAddingNewChild: false,
      isContextMenuVisible: false,
      newChildIndex: null,
      isBeingDragged: false,
      moveY: 0,
      isInFront: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isCommandPressed && !this.state.isAddingNewChild) {
      this.setState(() => ({newChildIndex: null}))
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
      if (descriptorType === 'ReferenceToLocalHiddenValue') {
        nodePath = this.props.rootPath.concat('localHiddenValuesById', which)
        nodeId = which
        const renderValue = getLocalHiddenValue(which)
        if (
          renderValue &&
          renderValue.__descriptorType === 'ComponentInstantiationValueDescriptor'
        ) {
          nodeChildren = [].concat(renderValue.props.children)
          nodeContent = getComponentDescriptor(renderValue.componentId).displayName
        }
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
    this.setState(() => ({newChildIndex: null}))
  }

  mouseEnterHandler = e => {
    e.stopPropagation()
    if (this.props.onMouseEnter) this.props.onMouseEnter()
  }

  mouseMoveHandler = (e, newChildIndex) => {
    e.stopPropagation()
    if (this.state.newChildIndex === newChildIndex) return
    this.setState(() => ({newChildIndex}))
  }

  bringToFront = () => {
    this.setState(() => ({isInFront: true}))
    this.props.bringParentToFront()
  }

  sendToBack = () => {
    this.setState(() => ({isInFront: false}))
    this.props.sendParentToBack()
  }

  render() {
    const {props, state} = this
    const {newChildIndex, isBeingDragged, moveY, isInFront} = state
    const {
      addToRefMap,
      getLocalHiddenValue,
      rootPath,
      descriptor,
      dispatch,
      moveNode,
      deleteNode,
      addChildToNode,
      updateTextChildContent,
      isCommandPressed,
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

    const acceptsChild =
      isCommandPressed && nodeType === 'tag' && typeof nodeChildren[0] !== 'string'

    return (
      <DraggableArea
        withShift={true}
        onDragStart={() => {
          document.styleSheets[0].insertRule('* {cursor: -webkit-grab !important; pointer-events: none}', document.styleSheets[0].cssRules.length)
          this.bringToFront()
          this.setState(() => ({isBeingDragged: true}))
        }}
        onDrag={(_, y) => this.setState(() => ({moveY: y}))}
        onDragEnd={() => {
          document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
          this.sendToBack()
          this.setState(() => ({isBeingDragged: false, moveY: 0}))
        }}
      >
        <div
        className={cx(css.container, {[css.collapsed]: isBeingDragged, [css.inFront]: isInFront, [css.notRoot]: depth > 0})}
          style={{'--depth': depth, transform: `translateY(${moveY}px)`}}
          // onMouseOver={() => console.log('over', nodeId)}
          // onClick={e => {
          //   e.stopPropagation()
          //   if (e.shiftKey) return
          //   e.persist()
          //   // console.log('clicked', nodeId, e)
          // }}
          // onDrag={e => {
          //   e.persist()
          //   console.log(e.clientY)}}
          // draggable={true}
          // onDragOver={e => {
          //   e.preventDefault()
          //   e.stopPropagation()
          //   console.log(nodeId)}
          // }
        >
          <div
            className={css.contentContainer}
            onMouseEnter={this.mouseEnterHandler}
            onMouseMove={e => this.mouseMoveHandler(e, 0)}
            onMouseLeave={this.resetNewChildIndex}
          >
            <div
              {...(nodePath != null
                ? {
                    onClick: () =>
                      dispatch(
                        reduceStateAction(['x2', 'pathToInspectableInX2'], () => nodePath),
                      ),
                  }
                : {})}
              className={css.content}
              // onContextMenu={this.contextMenuHandler}
              style={{cursor: 'pointer'}}
            >
              {nodeType === 'tag' ? (
                <div>
                  <span>&lt;</span>
                  <span>{nodeContent}</span>
                  <span>&gt;</span>
                  <span>&nbsp;</span>
                  <span>
                    <i>class</i>
                  </span>
                </div>
              ) : (
                <input
                  value={nodeContent}
                  onChange={e =>
                    updateTextChildContent(
                      this.props.parentPath.slice(-1)[0],
                      e.target.value,
                    )
                  }
                />
              )}
            </div>
            <AddBar
              shouldRender={acceptsChild && newChildIndex === 0}
              depth={depth + 1}
              onAnimationStart={() => this.setState(() => ({isAddingNewChild: true}))}
              onClick={() => this._addChildToNode(nodeId)}
            />
          </div>
          {nodeId &&
            this.state.isContextMenuVisible && (
              <ContextMenu
                {...(depth !== 0 ? {onMove: dir => this._moveNode(nodeId, dir)} : {})}
                {...(depth !== 0 ? {onDelete: () => this._deleteNode(nodeId)} : {})}
                depth={depth}
              />
            )}
          {nodeChildren.length > 0 &&
            nodeChildren.map((cd, i) => {
              return (
                <div
                  key={i}
                  className={css.childContainer}
                  onMouseEnter={this.mouseEnterHandler}
                  onMouseMove={e => this.mouseMoveHandler(e, i + 1)}
                  onMouseLeave={this.resetNewChildIndex}
                >
                  <WrappedRenderTreeNode
                    descriptor={cd}
                    depth={depth + 1}
                    rootPath={rootPath}
                    parentPath={nodePath}
                    getLocalHiddenValue={getLocalHiddenValue}
                    addToRefMap={addToRefMap}
                    moveNode={moveNode}
                    deleteNode={deleteNode}
                    addChildToNode={addChildToNode}
                    updateTextChildContent={updateTextChildContent}
                    onMouseEnter={this.resetNewChildIndex}
                    isCommandPressed={isCommandPressed}
                    bringParentToFront={this.bringToFront}
                    sendParentToBack={this.sendToBack}
                  />
                  <AddBar
                    shouldRender={acceptsChild && newChildIndex === i + 1}
                    depth={depth + 1}
                    onAnimationStart={() => this.setState(() => ({isAddingNewChild: true}))}
                    onClick={() => this._addChildToNode(nodeId)}
                  />
                </div>
              )
            })}
        </div>
      </DraggableArea>
    )
  }
}

const WrappedRenderTreeNode = connect(s => {
  return {
    getComponentDescriptor: id => getComponentDescriptor(s, id),
  }
})(RenderTreeNode)

export default WrappedRenderTreeNode
