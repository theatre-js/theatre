// @flow
import {
  React,
  compose,
  connect,
  reduceStateAction,
  multiReduceStateAction,
} from '$studio/handy'
import css from './index.css'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash'
import generateUniqueId from 'uuid/v4'
import RenderTreeNode from './RenderTreeNode'
import DraggableNode from './DraggableNode'
import MouseDetector from './MouseDetector'
import cx from 'classnames'

type Props = {
  pathToComponentDescriptor: Array<string>,
  componentDescriptor: Object,
  dispatch: Function,
}

type State = {
  deltaScroll: number,
  isCommandPressed: boolean,
  activeDropZoneProps: ?{
    atId: string,
    atIndex: number,
    atDepth: number,
  },
  nodeBeingDraggedProps: ?{
    id: string,
    path: string[],
    depth: number,
    top: number,
    height: number,
    clickOffsetY: number,
  },
}

class TreeEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props
  refMap: Object

  constructor(props: Props) {
    super(props)

    this.scrollInterval = null
    this.refMap = {}
    this.state = {
      deltaScroll: 0,
      isCommandPressed: false,
      nodeBeingDraggedProps: null,
      activeDropZoneProps: null,
    }
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyUpHandler)
    document.addEventListener('keydown', this.keyDownHandler)
    document.addEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyUpHandler)
    document.removeEventListener('keydown', this.keyDownHandler)
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  keyUpHandler = e => {
    if (e.key === 'Meta' || e.key === 'Control') {
      this.setState(() => ({isCommandPressed: false}))
    }
  }

  keyDownHandler = e => {
    if (e.key === 'Meta' || e.key === 'Control') {
      this.setState(() => ({isCommandPressed: true}))
    }
  }

  visibilityChangeHandler = () => {
    this.setState(() => ({isCommandPressed: false}))
  }

  dropHandler = () => {
    this.makeTheMoveHappen()
    this.unsetNodeBeingDragged()
  }

  setNodeBeingDragged = props => {
    document.styleSheets[0].insertRule(
      '* {cursor: -webkit-grab !important;}',
      document.styleSheets[0].cssRules.length,
    )
    const {
      nodeId: id,
      nodePath: path,
      nodeContent: content,
      depth,
      top,
      height,
      offsetY: clickOffsetY,
    } = props
    this.setState(() => ({
      nodeBeingDraggedProps: {id, path, depth, content, top, height, clickOffsetY},
    }))
  }

  unsetNodeBeingDragged = () => {
    document.styleSheets[0].removeRule(document.styleSheets[0].cssRules.length - 1)
    this.setState(() => ({nodeBeingDraggedProps: null}))
  }

  setActiveDropZone = (atId, atIndex, atDepth) => {
    this.setState(() => ({activeDropZoneProps: {atId, atIndex, atDepth}}))
  }

  unsetActiveDropZone = () => {
    this.setState(() => ({activeDropZoneProps: null}))
  }

  addToRefMap = (id: string, obj: Object) => {
    this.refMap[id] = {...this.refMap[id], ...obj}
  }

  makeTheMoveHappen = () => {
    const {dispatch, pathToComponentDescriptor} = this.props
    const {activeDropZoneProps, nodeBeingDraggedProps} = this.state

    if (activeDropZoneProps == null) {
      this.setState(() => ({deltaScroll: 0}))
      return
    }

    let dropAtIndex = activeDropZoneProps.atIndex
    const dropAtId = activeDropZoneProps.atId
    const {id: nodeId} = nodeBeingDraggedProps
    const {parent: currentParentId, index: currentIndex} = this.refMap[nodeId]
    if (currentParentId === dropAtId && currentIndex < dropAtIndex) dropAtIndex--

    let nodeToMove
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', currentParentId),
        currentParent => {
          nodeToMove = currentParent.props.children.splice(currentIndex, 1)
          return currentParent
        },
      ),
    )
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', dropAtId),
        newParent => {
          const {children} = newParent.props
          newParent.props.children = [
            ...children.slice(0, dropAtIndex),
            ...nodeToMove,
            ...children.slice(dropAtIndex),
          ]
          return newParent
        },
      ),
    )
    this.setState(() => ({deltaScroll: 0}))
  }

  deleteNode = id => {
    const {pathToComponentDescriptor, dispatch} = this.props
    const {parent: parentId, index} = this.refMap[id]
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', parentId),
        parent => {
          parent.props.children.splice(index, 1)
          return parent
        },
      ),
    )
  }

  addTextChild = id => {
    const {pathToComponentDescriptor, dispatch} = this.props
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        node => {
          node.props.children = ''
          return node
        },
      ),
    )
  }

  deleteTextChild = id => {
    const {pathToComponentDescriptor, dispatch} = this.props
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        node => {
          node.props.children = []
          return node
        },
      ),
    )
  }

  addChildToNode = (id, index) => {
    const {dispatch, pathToComponentDescriptor} = this.props
    const childId = generateUniqueId()
    // let tag = type
    let tag = 'div'
    let children = []
    // if (type === 'div with text') {
    //   tag = 'div'
    //   children = ''
    // }
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById'),
          reducer: values => {
            const child = {
              __descriptorType: 'ComponentInstantiationValueDescriptor',
              componentId: 'TheaterJS/Core/HTML/' + tag,
              props: {
                key: childId,
                children,
              },
              modifierInstantiationDescriptors: {
                byId: {},
                list: [],
              },
            }
            return {...values, [childId]: child}
          },
        },
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById', id),
          reducer: node => {
            const child = {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: childId,
            }
            const {children} = node.props
            node.props.children = [
              ...children.slice(0, index),
              child,
              ...children.slice(index),
            ]
            return node
          },
        },
      ]),
    )
  }

  updateTextNodeContent = (id, newContent) => {
    const {dispatch, pathToComponentDescriptor} = this.props
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        node => {
          node.props.children = newContent
          return node
        },
      ),
    )
  }

  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.componentDescriptor.localHiddenValuesById[id]
  }

  startScroll = dir => {
    if (this.state.nodeBeingDraggedProps == null) return
    const delta = dir === 'up' ? -1 : dir === 'down' ? 1 : 0
    const maxScroll =
      this.treeWrapper.scrollHeight -
      parseFloat(getComputedStyle(this.treeContainer).paddingBottom) -
      this.treeWrapper.clientHeight
    this.scrollInterval = setInterval(() => {
      const scrollTo = parseInt(_.clamp(this.treeWrapper.scrollTop + delta, 0, maxScroll))
      if (this.treeWrapper.scrollTop !== scrollTo) {
        this.treeWrapper.scrollTop = scrollTo
        this.setState(state => ({deltaScroll: state.deltaScroll + delta}))
      }
    }, 10)
  }

  stopScroll = () => {
    clearInterval(this.scrollInterval)
  }

  render() {
    const {componentDescriptor, pathToComponentDescriptor} = this.props
    const {isCommandPressed, nodeBeingDraggedProps, activeDropZoneProps} = this.state
    const isANodeBeingDragged = nodeBeingDraggedProps != null
    return (
      <div className={css.container}>
        <PanelSection withHorizontalMargin={false} label="Render Tree">
          <MouseDetector
            mouseOverCallback={() => this.startScroll('up')}
            mouseLeaveCallback={() => this.stopScroll()}
          />
          <div className={css.treeWrapper} ref={c => (this.treeWrapper = c)}>
            <div
              ref={c => (this.treeContainer = c)}
              className={cx(css.treeContainer, {[css.isDragging]: isANodeBeingDragged})}
            >
              {isANodeBeingDragged && (
                <DraggableNode
                  deltaScroll={this.state.deltaScroll}
                  depth={
                    activeDropZoneProps != null
                      ? activeDropZoneProps.atDepth
                      : nodeBeingDraggedProps.depth - 1
                  }
                  onDrop={this.dropHandler}
                  nodeProps={nodeBeingDraggedProps}
                  getLocalHiddenValue={this.getLocalHiddenValue}
                />
              )}
              <RenderTreeNode
                descriptor={componentDescriptor.whatToRender}
                moveNode={this.moveNode}
                deleteNode={this.deleteNode}
                addChildToNode={this.addChildToNode}
                updateTextNodeContent={this.updateTextNodeContent}
                rootPath={pathToComponentDescriptor}
                parentPath={pathToComponentDescriptor}
                addToRefMap={this.addToRefMap}
                getLocalHiddenValue={this.getLocalHiddenValue}
                isCommandPressed={isCommandPressed}
                isANodeBeingDragged={isANodeBeingDragged}
                setNodeBeingDragged={this.setNodeBeingDragged}
                setActiveDropZone={this.setActiveDropZone}
                unsetActiveDropZone={this.unsetActiveDropZone}
                addTextChild={this.addTextChild}
                deleteTextChild={this.deleteTextChild}
              />
            </div>
          </div>
          <MouseDetector
            mouseOverCallback={() => this.startScroll('down')}
            mouseLeaveCallback={() => this.stopScroll()}
          />
        </PanelSection>
      </div>
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      componentDescriptor: _.get(s, op.pathToComponentDescriptor),
    }
  }),
)(TreeEditor)
