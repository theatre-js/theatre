// @flow
import {React} from '$studio/handy'
import css from './NodeContainer.css'
import ComponentNode from './ComponentNode'
import TextNode from './TextNode'
import NodePlaceholder from './NodePlaceholder'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import cx from 'classnames'
import {ACTION, STATUS, NODE_TYPE} from './constants'

type Props = {
  nodeData: Object
  depth?: number
  isCommandDown: boolean
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

  handleClickToAdd = (e: $FixMe, index: number) => {
    e.stopPropagation()
    e.preventDefault()
    if (this.props.isCommandDown) this.addChild(index)
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

  onCancelSelectingType = () => {
    if (this.props.nodeData.status === STATUS.UNINITIALIZED) {
      this.deleteNode()
    }
    if (this.props.nodeData.status === STATUS.TEXT_CHANGING_TYPE) {
      this.props.cancelTextNodeTypeChange(this.props.nodeData.id)
    }
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
      isCommandDown,
    } = this.props
    const {isCollapsed, maxHeight, contextMenuProps} = this.state

    const isText =
      nodeProps.type === NODE_TYPE.TEXT &&
      nodeProps.status !== STATUS.TEXT_CHANGING_TYPE
    const depth = this.props.depth || 0
    const isRelocated = nodeProps.status === STATUS.RELOCATED
    // const isComponent =
    //   nodeProps.status === STATUS.UNINITIALIZED ||
    //   nodeProps.type === NODE_TYPE.COMPONENT ||
    //   nodeProps.status === STATUS.TEXT_CHANGING_TYPE
    const isComponent = nodeProps.type === NODE_TYPE.COMPONENT
    const shouldRenderComponent =
      isComponent ||
      nodeProps.status === STATUS.UNINITIALIZED ||
      nodeProps.status === STATUS.TEXT_CHANGING_TYPE
    const isSelected = nodeProps.id === selectedNodeId
    const shouldReactToCommandDown = isCommandDown && isComponent

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
            [css.isSelected]: isSelected,
            [css.isCommandDown]: shouldReactToCommandDown,
          })}
          onMouseUp={this.mouseUpHandler}
        >
          <div
            className={cx(css.root, {[css.isCommandDown]: shouldReactToCommandDown})}
            onContextMenu={this.contextMenuHandler}
            onMouseDown={this.mouseDownHandler}
            {...(isComponent ? {onClick: (e: $FixMe) => this.handleClickToAdd(e, 0)} : {})}
            // {...(!isText
            //   ? {
            //       onMouseMove: e => this.setPlaceholderAsActive(0, e),
            //       onMouseLeave: this.unsetPlaceholderAsActive,
            //     }
            //   : {})}
          >
            {shouldRenderComponent && (
              <ComponentNode
                isSelected={isSelected}
                nodeProps={nodeProps}
                setClassValue={this.setNodeClassValue}
                onSelect={() => this.props.setSelectedNodeId(nodeProps.id)}
                listOfDisplayNames={this.props.listOfDisplayNames}
                hasChildren={children && children.length > 0}
                onSelectComponentType={this.setComponentType}
                onCancelSelectingType={this.onCancelSelectingType}
              />
            )}
            {isText && (
              <TextNode
                nodeProps={nodeProps}
                onChange={this.changeTextNodeValue}
                handleTypeChange={this.handleTextNodeTypeChange}
              />
            )}
          </div>
          {/* {this.renderNodePlaceholder(0, depth)} */}
          {children &&
            children.map((child, index) => (
              <div className={css.childContainer} key={child.id}>
                <div
                  className={cx(css.hoverSensorLeft, {[css.isCommandDown]: shouldReactToCommandDown})}
                  // onMouseMove={e => this.setPlaceholderAsActive(index + 1, e)}
                  // onMouseLeave={this.unsetPlaceholderAsActive}
                  // onClick={() => this.props.setSelectedNodeId(nodeProps.id)}
                  {...(isComponent ? {onClick: (e: $FixMe) => this.handleClickToAdd(e, index + 1)} : {})}
                />
                <div className={css.child}>
                  <NodeContainer
                    key={child.id}
                    isCommandDown={isCommandDown}
                    selectedNodeId={this.props.selectedNodeId}
                    nodeData={child}
                    depth={depth + 1}
                    dispatchAction={this.props.dispatchAction}
                    isANodeBeingDragged={isANodeBeingDragged}
                    setNodeBeingDragged={this.props.setNodeBeingDragged}
                    setActiveDropZone={this.props.setActiveDropZone}
                    unsetActiveDropZone={this.props.unsetActiveDropZone}
                    setSelectedNodeId={this.props.setSelectedNodeId}
                    listOfDisplayNames={this.props.listOfDisplayNames}
                    handleTextNodeTypeChange={this.props.handleTextNodeTypeChange}
                    cancelTextNodeTypeChange={this.props.cancelTextNodeTypeChange}
                  />
                </div>
                <div
                  className={cx(css.hoverSensorBottom, {[css.isCommandDown]: shouldReactToCommandDown})}
                  // onMouseMove={e => this.setPlaceholderAsActive(index + 1, e)}
                  // onMouseLeave={this.unsetPlaceholderAsActive}
                  // onClick={() => this.props.setSelectedNodeId(nodeProps.id)}
                  {...(isComponent ? {onClick: (e: $FixMe) => this.handleClickToAdd(e, index + 1)} : {})}
                />
              </div>
            )
              
              // this.renderNodePlaceholder(index + 1, depth),
            // ]
            )}
        </div>
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({contextMenuProps: null}))}
            centerPoint={contextMenuProps}
            placement="left"
            items={[
              {
                label: 'garply',
                cb: () => console.log('garply'),
              },
              {
                label: 'waldo',
                cb: () => console.log('waldo'),
              },
              {
                label: 'delete',
                cb: this.deleteNode,
              },
              {
                label: 'plugh',
                cb: () => console.log('plugh'),
              },
              {
                label: 'xyzzy',
                cb: () => console.log('xyzzy'),
              },
            ]}
          />
        )}
      </div>
    )
  }
}

export default NodeContainer
