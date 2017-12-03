// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'
import ContextMenu from './ContextMenu'
import AddBar from './AddBar'
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
  updateTextChildContent: Function,
  depth?: number,
}

type Props = OwnProps & {
  getComponentDescriptor: Function,
  dispatch: Function,
}

type State = {
  isContextMenuVisible: boolean,
  newChildIndex: ?number,
  isCommandPressed: boolean,
}

class RenderTreeNode extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      isContextMenuVisible: false,
      newChildIndex: null,
      isCommandPressed: false,
    }
  }

  componentDidMount() {
    document.addEventListener('keyup', e => {
      if (e.key === 'Meta' || e.key === 'Control') {
        this.setState(() => ({isCommandPressed: false, newChildIndex: null}))
      }
    })
    document.addEventListener('keydown', e => {
      if (e.key === 'Meta' || e.key === 'Control') {
        this.setState(() => ({isCommandPressed: true}))
      }
    })
    document.addEventListener('visibilitychange', () => {
      this.setState(() => ({isCommandPressed: false, newChildIndex: null}))
    })
  }

  componentWillUnmount() {
    // remove listeners!
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
        if (renderValue.__descriptorType === 'ComponentInstantiationValueDescriptor') {
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

  _addChildToNode = id => {
    this.props.addChildToNode(id)
    this._toggleContextMenu()
  }

  resetNewChildIndex = () => {
    this.setState(() => ({newChildIndex: null}))
  }

  mouseEnterHandler = e => {
    e.stopPropagation()
    if (this.props.onMouseEnter) this.props.onMouseEnter()
  }

  mouseMoveHandler = (e, newChildIndex) => {
    e.stopPropagation()
    this.setState(() => ({newChildIndex}))
  }

  render() {
    const {props, state} = this
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
    } = props
    const {newChildIndex, isCommandPressed} = state

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

    return (
      <div className={cx(css.container, {[css.notRoot]: depth > 0})} style={{'--depth': depth}}>
        <div
          className={css.contentContainer}
          onMouseEnter={this.mouseEnterHandler}
          onMouseMove={e => this.mouseMoveHandler(e, 0)}
          onMouseLeave={this.resetNewChildIndex}>
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
            onContextMenu={this.contextMenuHandler}
            style={{cursor: 'pointer'}}
          >
            {nodeType === 'tag' ? (
              nodeContent
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
          {isCommandPressed && newChildIndex === 0 && <AddBar />}
        </div>
        {nodeId &&
          this.state.isContextMenuVisible && (
            <ContextMenu
              {...(depth !== 0 ? {onMove: dir => this._moveNode(nodeId, dir)} : {})}
              {...(depth !== 0 ? {onDelete: () => this._deleteNode(nodeId)} : {})}
              {...(nodeChildren.length === 0 || typeof nodeChildren[0] !== 'string'
                ? {onAddChild: () => this._addChildToNode(nodeId)}
                : {})}
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
                  onMouseLeave={this.resetNewChildIndex}>
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
                  />
                  {isCommandPressed && i + 1 === newChildIndex &&
                    <AddBar />
                  }
                </div>
              )
            })
        }
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
