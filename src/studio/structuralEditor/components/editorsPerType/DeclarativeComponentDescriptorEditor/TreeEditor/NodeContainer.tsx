// @flow
import {React} from '$studio/handy'
import css from './NodeContainer.css'
import ComponentNode from './ComponentNode'
import TextNode from './TextNode'
import NodePlaceholder from './NodePlaceholder'
import ContextMenu from './ContextMenu'
import ContextMenuItem from './ContextMenuItem'
import cx from 'classnames'
import {ACTION, STATUS, NODE_TYPE} from './constants'

type Props = {
  nodeData: Object
  depth?: number
}
type State = {
  newChildIndex: undefined | null | number
  isCollapsed: boolean
  maxHeight: undefined | null | number
  initialTopOffset: number
  contextMenuProps: undefined | null | Object
}

class NodeContainer extends React.PureComponent<Props, State> {
  unsetTimeout = null
  state = {
    newChildIndex: null,
    isCollapsed: false,
    maxHeight: null,
    initialTopOffset: 0,
    contextMenuProps: null,
  }

  componentDidMount() {
    if (this.props.nodeData.status === STATUS.RELOCATED) {
      const {nodeData: {actionPayload}} = this.props
      const {droppedAt} = actionPayload
      const {top} = this.wrapper.getBoundingClientRect()
      this.setState(() => ({
        initialTopOffset: droppedAt - top,
        maxHeight: actionPayload.height,
      }))
    } else {
      this._setMaxHeight()
    }

    // if (this.props.nodeData.status === STATUS.UNINITIALIZED) {
    //   setTimeout(this.setAsComponentBeingSet, 150)
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeData.status === STATUS.RELOCATED) {
      const {nodeData: {actionPayload}} = nextProps
      const {droppedAt} = actionPayload
      const {nodeData: {actionPayload: currentPayload}} = this.props
      if (
        currentPayload == null ||
        (currentPayload != null && currentPayload.droppedAt !== droppedAt)
      ) {
        const {top} = this.wrapper.getBoundingClientRect()
        this.setState(() => ({
          initialTopOffset: droppedAt - (top - 32),
          maxHeight: actionPayload.height,
        }))
      }
    }

    if (!nextProps.isANodeBeingDragged) {
      this.setState(() => ({isCollapsed: false, newChildIndex: null}))
    }

    if (
      this.props.nodeData.children &&
      nextProps.nodeData.children &&
      nextProps.nodeData.children.length !== this.props.nodeData.children.length
    ) {
      setTimeout(() => {
        this._setMaxHeight()
      }, 500)
    }

    // if (nextProps.nodeData.status === STATUS.CREATION_CANCELED) {
    //   this.deleteNode()
    // }
  }

  componentWillUnmount() {
    this._clearUnsetTimeout()
  }

  _setMaxHeight() {
    this.setState(() => ({
      maxHeight: this.wrapper.getBoundingClientRect().height + 30,
    }))
  }

  mouseDownHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    if (!e.shiftKey || !this.props.depth) return

    const {
      setNodeBeingDragged,
      depth,
      nodeData: {children, ...nodeProps},
    } = this.props
    const {maxHeight: height} = this.state
    const {top} = this.wrapper.getBoundingClientRect()
    const {offsetY} = e.nativeEvent
    this.setState(() => ({isCollapsed: true}))
    setNodeBeingDragged({nodeProps, depth, top, height, offsetY})
  }

  mouseUpHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    if (this.props.isANodeBeingDragged && this.state.newChildIndex != null) {
      this.unsetPlaceholderAsActive()
      this.props.dispatchAction(ACTION.NODE_MOVE, {
        id: this.props.nodeData.id,
        index: this.state.newChildIndex,
        mouseY: e.clientY,
      })
    }
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.setState(() => ({contextMenuProps: {left: clientX, top: clientY}}))
  }

  setPlaceholderAsActive = (onIndex, e) => {
    if (e != null && !e.metaKey && !this.props.isANodeBeingDragged) {
      if (this.state.newChildIndex != null) this.unsetPlaceholderAsActive()
      return
    }

    this._clearUnsetTimeout()

    this.setState(() => ({newChildIndex: onIndex}))
    if (this.props.isANodeBeingDragged) {
      this.props.setActiveDropZone({
        id: this.props.nodeData.id,
        index: onIndex,
        depth: this.props.depth + 1 || 1,
      })
    }
  }

  unsetPlaceholderAsActive = () => {
    if (this.state.newChildIndex == null) return

    this.unsetTimeout = setTimeout(() => {
      this.setState(() => ({newChildIndex: null}))
      this.props.unsetActiveDropZone()
    }, 0)
  }

  _clearUnsetTimeout() {
    if (this.unsetTimeout != null) {
      clearTimeout(this.unsetTimeout)
      this.unsetTimeout = null
    }
  }

  setAsComponentBeingSet = () => {
    const {
      setComponentBeingSet,
      depth,
      nodeData: {children, ...nodeProps},
    } = this.props
    const {top, left, width} = this.wrapper.getBoundingClientRect()
    setComponentBeingSet({
      nodeProps,
      depth,
      top,
      left,
      width,
      hasChildren: children != null && children.length > 0,
    })
  }

  handleTextNodeTypeChange = () => {
    this.props.handleTextNodeTypeChange(this.props.nodeData.id)
  }

  addChild = atIndex => {
    this.props.dispatchAction(ACTION.NODE_ADD, {
      nodeId: this.props.nodeData.id,
      atIndex,
    })
  }

  deleteNode = () => {
    this.setState(() => ({contextMenuProps: null, isCollapsed: true}))
    setTimeout(() => {
      const {id: nodeId, parentId, index} = this.props.nodeData
      this.props.dispatchAction(ACTION.NODE_DELETE, {nodeId, parentId, index})
    }, 300)
  }

  changeTextNodeValue = value => {
    this.props.dispatchAction(ACTION.NODE_TEXT_CHANGE, {
      nodeId: this.props.nodeData.id,
      value,
    })
  }

  setNodeClassValue = value => {
    this.props.dispatchAction(ACTION.NODE_CLASS_SET, {
      nodeId: this.props.nodeData.id,
      value,
    })
  }

  setComponentType = newType => {
    this.props.dispatchAction(ACTION.NODE_TYPE_SET, {
      nodeId: this.props.nodeData.id,
      nodeType: this.props.nodeData.type,
      newType,
    })
  }

  renderNodePlaceholder(atIndex, depth) {
    return (
      <NodePlaceholder
        key="placeholder"
        depth={depth}
        shouldRender={this.state.newChildIndex === atIndex}
        renderDropZone={this.props.isANodeBeingDragged}
        onAdd={() => this.addChild(atIndex)}
        onMouseEnter={() => this.setPlaceholderAsActive(atIndex)}
        onMouseLeave={() => this.unsetPlaceholderAsActive()}
      />
    )
  }

  render() {
    const {
      nodeData: {children, ...nodeProps},
      isANodeBeingDragged,
      selectedNodeId,
    } = this.props
    const {isCollapsed, maxHeight, contextMenuProps} = this.state

    const isText =
      nodeProps.type === NODE_TYPE.TEXT &&
      nodeProps.status !== STATUS.CHANGING_TYPE
    const depth = this.props.depth || 0
    const isRelocated = nodeProps.status === STATUS.RELOCATED
    const isComponent =
      nodeProps.status === STATUS.UNINITIALIZED ||
      nodeProps.type === NODE_TYPE.COMPONENT ||
      nodeProps.status === STATUS.CHANGING_TYPE
    return (
      <div ref={c => (this.wrapper = c)}>
        <div
          style={{
            '--depth': depth,
            '--maxHeight': maxHeight,
            '--initialTopOffset': isRelocated ? this.state.initialTopOffset : 0,
          }}
          className={cx(css.container, {
            [css.isRelocated]:
              isRelocated || nodeProps.status === STATUS.RELOCATION_CANCELED,
            [css.expand]:
              nodeProps.status === STATUS.UNINITIALIZED ||
              nodeProps.status === STATUS.CREATION_CANCELED,
            [css.isCollapsed]: isCollapsed,
          })}
          onMouseUp={this.mouseUpHandler}
        >
          <div
            className={css.root}
            onContextMenu={this.contextMenuHandler}
            onMouseDown={this.mouseDownHandler}
            {...(!isText
              ? {
                  onMouseMove: e => this.setPlaceholderAsActive(0, e),
                  onMouseLeave: this.unsetPlaceholderAsActive,
                }
              : {})}
          >
            {isComponent && (
              <ComponentNode
                isSelected={nodeProps.id === selectedNodeId}
                nodeProps={nodeProps}
                setClassValue={this.setNodeClassValue}
                setAsComponentBeingSet={this.setAsComponentBeingSet}
                onSelect={() => this.props.setSelectedNodeId(nodeProps.id)}
                listOfDisplayNames={this.props.listOfDisplayNames}
                hasChildren={children && children.length > 0}
                onSelectComponentType={this.setComponentType}
                onCancelCreatingNode={this.deleteNode}
              />
            )}
            {isText && (
              <TextNode
                nodeProps={nodeProps}
                onChange={this.changeTextNodeValue}
                setAsComponentBeingSet={this.setAsComponentBeingSet}
                handleTypeChange={this.handleTextNodeTypeChange}
              />
            )}
          </div>
          {this.renderNodePlaceholder(0, depth)}
          {children &&
            children.map((child, index) => [
              <div
                key="hoverSensor"
                className={css.hoverSensor}
                onMouseMove={e => this.setPlaceholderAsActive(index + 1, e)}
                onMouseLeave={this.unsetPlaceholderAsActive}
              />,
              <div key="child" className={css.child}>
                <NodeContainer
                  key={child.id}
                  selectedNodeId={this.props.selectedNodeId}
                  nodeData={child}
                  depth={depth + 1}
                  dispatchAction={this.props.dispatchAction}
                  isANodeBeingDragged={isANodeBeingDragged}
                  setNodeBeingDragged={this.props.setNodeBeingDragged}
                  setActiveDropZone={this.props.setActiveDropZone}
                  unsetActiveDropZone={this.props.unsetActiveDropZone}
                  // setComponentBeingSet={this.props.setComponentBeingSet}
                  setSelectedNodeId={this.props.setSelectedNodeId}
                  listOfDisplayNames={this.props.listOfDisplayNames}
                  handleTextNodeTypeChange={this.props.handleTextNodeTypeChange}
                />
              </div>,
              this.renderNodePlaceholder(index + 1, depth),
            ])}
        </div>
        {contextMenuProps != null && (
          <ContextMenu
            menuProps={contextMenuProps}
            close={() => this.setState(() => ({contextMenuProps: null}))}
            render={() => [
              <ContextMenuItem key="delete" onClick={this.deleteNode}>
                Delete
              </ContextMenuItem>,
              // <ContextMenuItem key='convert' onClick={() => console.log('convert')}>Convert</ContextMenuItem>,
            ]}
          />
        )}
      </div>
    )
  }
}

export default NodeContainer
