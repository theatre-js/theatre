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
import cx from 'classnames'

type Props = {
  pathToComponentDescriptor: Array<string>,
  componentDescriptor: Object,
  dispatch: Function,
}

type State = {
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

    this.refMap = {}
    this.state = {
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
    const {nodeId: id, nodePath: path, depth, top, height, offsetY: clickOffsetY} = props
    this.setState(() => ({nodeBeingDraggedProps: {id, path, depth, top, height, clickOffsetY}}))
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
      console.log('null drop zone')
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
      }),
    )
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

  render() {
    const {componentDescriptor, pathToComponentDescriptor} = this.props
    const {isCommandPressed, nodeBeingDraggedProps, activeDropZoneProps} = this.state
    const isANodeBeingDragged = nodeBeingDraggedProps != null
    return (
      <div className={css.container}>
        <PanelSection withHorizontalMargin={false} label="Render Tree">
          <div className={css.treeWrapper}>
            <div className={cx(css.treeContainer, {[css.isDragging]: isANodeBeingDragged})}>
              {isANodeBeingDragged &&
                <DraggableNode
                  depth={activeDropZoneProps != null ? activeDropZoneProps.atDepth : nodeBeingDraggedProps.depth}
                  onDrop={this.dropHandler}
                  nodeProps={nodeBeingDraggedProps}
                  getLocalHiddenValue={this.getLocalHiddenValue}/>
              }
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
              />
            </div>
          </div>
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
