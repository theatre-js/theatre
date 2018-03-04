
import {React} from '$studio/handy'
import css from './NodeContainer.css'
import ComponentNode from './ComponentNode'
import TextNode from './TextNode'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import cx from 'classnames'
import {ACTION, STATUS, NODE_TYPE} from './constants'
import MdCancel from 'react-icons/lib/md/cancel'
import MdCamera from 'react-icons/lib/md/camera'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdExplore from 'react-icons/lib/md/explore'
import MdStars from 'react-icons/lib/md/stars'
import * as _ from 'lodash'


type Props = {
  nodeData: Object
  depth?: number
  isCommandDown: boolean
}
type State = {
  isCollapsed: boolean
  isBeingDragged: boolean
  maxHeight: undefined | null | number
  contextMenuProps: undefined | null | Object
}

class NodeContainer extends React.PureComponent<Props, State> {
  unsetTimeout = null
  childContainersRefs = []
  state = {
    isCollapsed: false,
    isBeingDragged: false,
    maxHeight: null,
    contextMenuProps: null,
  }

  componentDidMount() {
    if (this.props.nodeData.status === STATUS.RELOCATED) {
      const {nodeData: {actionPayload}} = this.props
      this.setState(() => ({maxHeight: actionPayload.height,}))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeData.status === STATUS.CREATION_CANCELED) {
      this.deleteNode()
      return
    }
    if (nextProps.nodeData.status === STATUS.RELOCATED) {
      const {nodeData: {actionPayload}} = nextProps
      const {dropOffset} = actionPayload
      const {nodeData: {actionPayload: currentPayload}} = this.props
      if (
        currentPayload == null ||
        (currentPayload != null && !_.isEqual(currentPayload.dropOffset, dropOffset))
      ) {
        this.setState(() => ({
          maxHeight: actionPayload.height,
          isBeingDragged: false,
        }))
      }
    }

    if (this.state.isBeingDragged && !nextProps.isANodeBeingDragged) {
      if (this.state.isCollapsed || this.state.isBeingDragged) {
        this.setState(() => ({isCollapsed: false, isBeingDragged: false}))
      }
    }
  }

  mouseDownHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    if (!e.shiftKey || !this.props.depth) return

    const {setNodeBeingDragged, depth, nodeData} = this.props
    const {children, ...nodeProps} = nodeData
    const {top, left, height, width} = this.wrapper.getBoundingClientRect()

    let {offsetY, offsetX} = e.nativeEvent
    if (e.target !== this.rootWrapper) {
      let el = e.target
      let updateTop = true
      let updateLeft = true
      while (updateTop || updateLeft) {
        const {offsetTop, offsetLeft} = el
        if (updateTop && offsetTop === 0) updateTop = false
        if (updateLeft && offsetLeft === 0) updateLeft = false
        offsetY += updateTop ? offsetTop : 0
        offsetX += updateLeft ? offsetLeft : 0
        el = el.offsetParent
      }
    }
    this.setState(() => ({isBeingDragged: true, maxHeight: height}))
    setNodeBeingDragged({nodeProps, depth, top, left, height, width, offsetY, offsetX})
  }

  onDrop = (e: $FixMe, index: number) => {
    if (!this.props.isANodeBeingDragged) return
    e.stopPropagation()
    e.preventDefault()
    const {id} = this.props.nodeData
    const {clientX: mouseX, clientY: mouseY} = e
    const childrenLength = this.props.nodeData.children.length
    let targetLeft, targetTop, targetWidth
    if (childrenLength === 0) {
      const {left, bottom, width} = this.rootWrapper.getBoundingClientRect()
      targetLeft = left + parseInt(css.nodeIndent)
      targetTop = bottom
      targetWidth = width - parseInt(css.nodeIndent)
    }
    else if (index === childrenLength) {
      const {left, bottom, width} = this.childContainersRefs[index - 1].getBoundingClientRect()
      targetLeft = left
      targetTop = bottom
      targetWidth = width
    } else {
      const {left, top, width} = this.childContainersRefs[index].getBoundingClientRect()
      targetLeft = left
      targetTop = top
      targetWidth = width
    }

    this.props.dispatchAction(ACTION.NODE_MOVE, {id, index, mouseY, mouseX, targetTop, targetLeft, targetWidth})
  }

  handleClick = (e: $FixMe, index: number) => {
    e.stopPropagation()
    e.preventDefault()
    if (this.props.isCommandDown) {
      this.addChild(index)
    } else {
      this.props.setSelectedNodeId(this.props.nodeData.id)
    }
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.setState(() => ({contextMenuProps: {left: clientX, top: clientY}}))
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
    const {height} = this.wrapper.getBoundingClientRect()
    this.setState(() => ({contextMenuProps: null, isCollapsed: true, maxHeight: height}))
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
      this.props.cancelSettingType(this.props.nodeData)
      return
    }
    if (this.props.nodeData.status === STATUS.TEXT_CHANGING_TYPE) {
      this.props.cancelTextNodeTypeChange(this.props.nodeData.id)
      return
    }
  }

  render() {
    const {
      nodeData: {children, ...nodeProps},
      isANodeBeingDragged,
      selectedNodeId,
      isCommandDown,
    } = this.props
    const {isCollapsed, maxHeight, contextMenuProps, isBeingDragged} = this.state

    const isText =
      nodeProps.type === NODE_TYPE.TEXT &&
      nodeProps.status !== STATUS.TEXT_CHANGING_TYPE
    const depth = this.props.depth || 0
    const isRelocated = nodeProps.status === STATUS.RELOCATED
    const isComponent = nodeProps.type === NODE_TYPE.COMPONENT
    const shouldRenderComponent =
      isComponent ||
      nodeProps.status === STATUS.UNINITIALIZED ||
      nodeProps.status === STATUS.TEXT_CHANGING_TYPE
    const isSelected = nodeProps.id === selectedNodeId
    const shouldReactToCommandDown = isCommandDown && isComponent
    const shoudlIndicateDropPossible = isANodeBeingDragged && isComponent
    const shoudlIndicateDropNotPossible = isANodeBeingDragged && isText

    return (
      <div ref={c => (this.wrapper = c)}>
        <div
          style={{
            '--depth': depth,
            '--maxHeight': maxHeight,
            '--initialLeftOffset': isRelocated ? nodeProps.actionPayload.dropOffset.x : 0,
            '--initialTopOffset': isRelocated ? nodeProps.actionPayload.dropOffset.y : 0,
            '--originalWidth': isRelocated ? nodeProps.actionPayload.originalWidth : null,
            '--targetWidth': isRelocated ? nodeProps.actionPayload.targetWidth : null,
          }}
          className={cx(css.container, {
            [css.isRelocated]: isRelocated,
            [css.relocationCanceled]: nodeProps.status === STATUS.RELOCATION_CANCELED,
            [css.appear]:
              nodeProps.status === STATUS.UNINITIALIZED ||
              nodeProps.status === STATUS.CREATION_CANCELED,
            [css.isCollapsed]: isCollapsed,
            [css.isSelected]: isSelected && !isText,
            [css.isCommandDown]: shouldReactToCommandDown,
            [css.isBeingDragged]: isBeingDragged,
            [css.indicateDropPossible]: shoudlIndicateDropPossible,
            [css.indicateDropNotPossible]: shoudlIndicateDropNotPossible,
          })}
          >
          <div
            ref={c => this.rootWrapper = c}
            className={cx(css.rootWrapper, {
              [css.isCommandDown]: shouldReactToCommandDown,
              [css.isANodeBeingDragged]: shoudlIndicateDropPossible,
            })}
            onContextMenu={this.contextMenuHandler}
            onMouseDown={this.mouseDownHandler}
            {...(isComponent ? {
              onClick: (e: $FixMe) => this.handleClick(e, 0),
              onMouseUp: (e) => this.onDrop(e, 0),
            } : {})}
          >
            <div className={css.root}>
              {shouldRenderComponent && (
                <ComponentNode
                  isCommandDown={isCommandDown}
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
          </div>
          {children &&
            children.map((child, index) => (
              <div               
                className={css.childContainer}
                key={child.id}>
                <div
                  className={cx(css.hoverSensor, {
                    [css.isCommandDown]: shouldReactToCommandDown,
                    [css.isANodeBeingDragged]: shoudlIndicateDropPossible,
                  })}
                  {...(isComponent ? {
                    onClick: (e: $FixMe) => this.handleClick(e, index + 1),
                    onMouseUp: (e) => this.onDrop(e, index + 1),
                  } : {})}
                />
                <div
                  ref={c => this.childContainersRefs[index] = c} 
                  className={css.child}
                >
                  <NodeContainer
                    key={child.id}
                    isCommandDown={isCommandDown}
                    selectedNodeId={this.props.selectedNodeId}
                    nodeData={child}
                    depth={depth + 1}
                    dispatchAction={this.props.dispatchAction}
                    isANodeBeingDragged={isANodeBeingDragged}
                    setNodeBeingDragged={this.props.setNodeBeingDragged}
                    setSelectedNodeId={this.props.setSelectedNodeId}
                    listOfDisplayNames={this.props.listOfDisplayNames}
                    handleTextNodeTypeChange={this.props.handleTextNodeTypeChange}
                    cancelTextNodeTypeChange={this.props.cancelTextNodeTypeChange}
                    cancelSettingType={this.props.cancelSettingType}
                  />
                </div>
                <div className={css.siblingIndicator}/>
              </div>
            )
            )}
        </div>
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({contextMenuProps: null}))}
            centerPoint={contextMenuProps}
            placement="right"
            items={[
              {
                label: 'Clone to $A$rtboard',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: 'Locate in $E$xplore',
                cb: () => null,
                IconComponent: MdExplore,
              },
              {
                label: '$D$elete Object',
                cb: this.deleteNode,
                disabled: !this.props.depth,
                IconComponent: MdCancel,
              },
              {
                label: 'Add $M$odifier',
                cb: () => null,
                IconComponent: MdStars,
              },
              {
                label: '$C$onvert to Component',
                cb: () => null,
                IconComponent: MdCamera,
              },
            ]}
          />
        )}
      </div>
    )
  }
}

export default NodeContainer
