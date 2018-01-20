// @flow
import {React} from '$studio/handy'
import css from './NodeContainer.css'
import ComponentNode from './ComponentNode'
import TextNode from './TextNode'
import NodePlaceholder from './NodePlaceholder'
import cx from 'classnames'
import {
  TEXT,
  COMPONENT,
  CHILD_ADD,
  NODE_MOVE,
  CREATED,
  RELOCATED,
  RELOCATION_CANCELED,
} from './'

type Props = {
  nodeData: Object,
  depth?: number,
}
type State = {
  newChildIndex: ?number,
  isCollapsed: boolean,
  maxHeight: ?number,
}

class NodeContainer extends React.PureComponent<Props, State> {
  unsetTimeout = null
  state = {
    newChildIndex: null,
    isCollapsed: false,
    maxHeight: null,
    initialTopOffset: 0,
  }

  componentDidMount() {
    if (this.props.nodeData.status === RELOCATED) {
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

    if (
      this.props.nodeData.status === CREATED &&
      this.props.nodeData.type === COMPONENT
    ) {
      setTimeout(this.setAsComponentBeingChanged, 150)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeData.status === RELOCATED) {
      const {nodeData: {actionPayload}} = nextProps
      const {droppedAt} = actionPayload
      const {nodeData: {actionPayload: currentPayload}} = this.props
      if (
        currentPayload == null ||
        (currentPayload != null && currentPayload.droppedAt !== droppedAt)
      ) {
        const {top} = this.wrapper.getBoundingClientRect()
        this.setState(() => ({
          initialTopOffset: droppedAt - (top - 29),
          maxHeight: actionPayload.height,
        }))
      }
    }

    if (!nextProps.isANodeBeingDragged) {
      this.setState(() => ({isCollapsed: false, newChildIndex: null}))
    }

    if (
      this.props.nodeData.children &&
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
    this.setState(() => ({maxHeight: this.wrapper.getBoundingClientRect().height + 30}))
  }

  mouseDownHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    if (!e.shiftKey || !this.props.depth) return

    const {setNodeBeingDragged, depth, nodeData: {children, ...nodeProps}} = this.props
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
      this.props.dispatchAction(NODE_MOVE, {
        id: this.props.nodeData.id,
        index: this.state.newChildIndex,
        mouseY: e.clientY,
      })
    }
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

  setAsComponentBeingChanged = () => {
    const {
      setComponentBeingChanged,
      depth,
      nodeData: {children, ...nodeProps},
    } = this.props
    const {top, left, width} = this.wrapper.getBoundingClientRect()
    setComponentBeingChanged({nodeProps, depth, top, left, width})
  }

  addChild = atIndex => {
    this.props.dispatchAction(CHILD_ADD, {nodeId: this.props.nodeData.id, atIndex})
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
    const {nodeData: {children, ...nodeProps}, isANodeBeingDragged} = this.props
    const {isCollapsed, maxHeight} = this.state

    const isText = nodeProps.type === TEXT
    const depth = this.props.depth || 0
    const isRelocated = nodeProps.status === RELOCATED
    return (
      <div ref={c => (this.wrapper = c)}>
        <div
          style={{
            '--depth': depth,
            '--maxHeight': maxHeight,
            '--initialTopOffset': isRelocated ? this.state.initialTopOffset : 0,
          }}
          className={cx(css.container, {
            [css.isRelocated]: isRelocated || nodeProps.status === RELOCATION_CANCELED,
            [css.isCreated]: nodeProps.status === CREATED,
            [css.isCollapsed]: isCollapsed,
          })}
          onMouseUp={this.mouseUpHandler}
        >
          <div
            className={css.root}
            onMouseDown={this.mouseDownHandler}
            {...(!isText
              ? {
                  onMouseMove: e => this.setPlaceholderAsActive(0, e),
                  onMouseLeave: this.unsetPlaceholderAsActive,
                }
              : {})}
          >
            {nodeProps.type === COMPONENT && (
              <ComponentNode
                nodeProps={nodeProps}
                setAsComponentBeingChanged={this.setAsComponentBeingChanged}
              />
            )}
            {nodeProps.type === TEXT && <TextNode nodeProps={nodeProps} />}
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
                  nodeData={child}
                  depth={depth + 1}
                  dispatchAction={this.props.dispatchAction}
                  isANodeBeingDragged={isANodeBeingDragged}
                  setNodeBeingDragged={this.props.setNodeBeingDragged}
                  setActiveDropZone={this.props.setActiveDropZone}
                  unsetActiveDropZone={this.props.unsetActiveDropZone}
                  setComponentBeingChanged={this.props.setComponentBeingChanged}
                />
              </div>,
              this.renderNodePlaceholder(index + 1, depth),
            ])}
        </div>
      </div>
    )
  }
}

export default NodeContainer
