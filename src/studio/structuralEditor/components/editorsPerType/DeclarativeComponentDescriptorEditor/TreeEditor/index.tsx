// @flow
import {
  React,
  compose,
  connect,
  reduceStateAction,
  multiReduceStateAction,
} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'
import NodeContainer from './NodeContainer'
import MovableNode from './MovableNode'
import css from './index.css'
import generateUniqueId from 'uuid/v4'
import * as _ from 'lodash'
import {
  DESCRIPTOR_TYPE,
  ACTION,
  STATUS_BY_ACTION,
  NODE_TYPE,
  STATUS,
} from './constants'

type Props = {
  pathToComponentDescriptor: Array<string>
  rootComponentDescriptor: Object
  dispatch: Function
}

type State = {
  nodes: Object
  nodeBeingDragged:
    | undefined
    | null
    | {
        nodeProps: Object
        depth: number
        top: number
        height: number
        offsetY: number
      }
  activeDropZone:
    | undefined
    | null
    | {
        id: string
        index: number
        depth: number
      }
  componentBeingSet:
    | undefined
    | null
    | {
        nodeProps: Object
        depth: number
        top: number
        left: number
        width: number
      }
  selectedNodeId: undefined | null | string
}

class TreeEditor extends React.PureComponent<Props, State> {
  static getDefaultComponentProps = id => ({
    __descriptorType: DESCRIPTOR_TYPE.COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR,
    props: {
      key: id,
      children: [],
    },
    modifierInstantiationDescriptors: {
      byId: {},
      list: [],
    },
  })

  unsetDropZoneTimeout = null
  lastAction = {type: null, payload: null}
  state = {
    nodes: {},
    nodeBeingDragged: null,
    activeDropZone: null,
    selectedNodeId: null,
  }

  componentDidMount() {
    this._setNodes(this.props.rootComponentDescriptor)
  }

  componentWillReceiveProps(nextProps) {
    this._setNodes(nextProps.rootComponentDescriptor)
  }

  _setLastAction(type: string, payload: Object) {
    this.lastAction = {type, payload}
  }

  _unsetLastAction() {
    this.lastAction = {type: null, payload: null}
  }

  _setNodes(rootComponentDescriptor) {
    let nodes = {}
    if (
      rootComponentDescriptor.whatToRender.__descriptorType ===
      DESCRIPTOR_TYPE.REF_TO_LOCAL_HIDDEN_VALUE
    ) {
      const {localHiddenValuesById, whatToRender} = rootComponentDescriptor
      nodes = this._getComponentData(
        localHiddenValuesById[whatToRender.which],
        localHiddenValuesById,
      )
    }
    this._unsetLastAction()
    this.setState(() => ({nodes}))
  }

  _getComponentData(
    descriptor: Object,
    localHiddenValuesById: Object,
    index: number = 0,
    parentId: undefined | null | string = null,
  ): Object {
    const {getComponentDescriptor} = this.props
    if (descriptor.__descriptorType != null) {
      let which
      while (
        descriptor &&
        descriptor.__descriptorType ===
          DESCRIPTOR_TYPE.REF_TO_LOCAL_HIDDEN_VALUE
      ) {
        which = descriptor.which
        descriptor = localHiddenValuesById[which]
      }

      if (descriptor === null) {
        const {
          status,
          actionPayload,
        } = this._getComponentStatusAndActionPayload(which)
        return {
          id: which,
          status: status,
          ...actionPayload != null ? {actionPayload} : {},
          index,
          parentId,
        }
      }

      if (typeof descriptor === 'string') {
        const {
          status,
          actionPayload,
        } = this._getComponentStatusAndActionPayload(which)
        return {
          id: which,
          status: status,
          ...actionPayload != null ? {actionPayload} : {},
          type: NODE_TYPE.TEXT,
          value: descriptor,
          index,
          parentId,
        }
      }

      if (
        descriptor.__descriptorType ===
        DESCRIPTOR_TYPE.COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR
      ) {
        const {
          type: componentType,
          displayName: displayName,
        } = getComponentDescriptor(descriptor.componentId)

        const id = descriptor.props.key
        const {
          status,
          actionPayload,
        } = this._getComponentStatusAndActionPayload(id)
        return {
          id,
          status: status,
          ...actionPayload != null ? {actionPayload} : {},
          type: NODE_TYPE.COMPONENT,
          componentType,
          displayName,
          class: descriptor.props.class || '',
          index,
          parentId,
          children: []
            .concat(descriptor.props.children || [])
            .map((c, i) =>
              this._getComponentData(c, localHiddenValuesById, i, id),
            ),
        }
      }
    }
  }

  _getComponentStatusAndActionPayload(
    id: string,
  ): {stauts: string; actionPayload: undefined | null | Object} {
    let status = STATUS_BY_ACTION.DEFAULT,
      actionPayload
    if (this.lastAction.payload != null && this.lastAction.payload.id === id) {
      const {id, ...payload} = this.lastAction.payload
      status = STATUS_BY_ACTION[this.lastAction.type]
      actionPayload = payload
    }
    return {status, actionPayload}
  }

  _getComponentDescriptorByDisplayName(displayName: string) {
    return Object.values(this.props.componentTypes).find(
      c => c.displayName === displayName,
    )
  }

  setNodeBeingDragged = nodeBeingDragged => {
    document.styleSheets[0].insertRule(
      '* {cursor: -webkit-grab !important;}',
      document.styleSheets[0].cssRules.length,
    )

    this.setState(() => ({nodeBeingDragged}))
  }

  dispatchActionFromNode = (actionType: string, payload: Object) => {
    switch (actionType) {
      case ACTION.NODE_ADD:
        this._addChildToNode(payload)
        break
      case ACTION.NODE_MOVE:
        this.dropHandler(payload)
        break
      case ACTION.NODE_TEXT_CHANGE:
        this._changeNodeTextValue(payload)
        break
      case ACTION.NODE_DELETE:
        this._deleteNode(payload)
        break
      case ACTION.NODE_CLASS_SET:
        this._setNodeClassValue(payload)
        break
      case ACTION.NODE_TYPE_SET:
        this._setTypeOfComponent(payload)
        break
      default:
        throw Error('This should never happen!')
    }
  }

  _addChildToNode({nodeId, atIndex}: {nodeId: string; atIndex: number}) {
    const {dispatch, pathToComponentDescriptor} = this.props
    const childId = generateUniqueId()
    this._setLastAction(ACTION.NODE_ADD, {id: childId})
    this.setState(() => ({selectedNodeId: childId}))
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById'),
          reducer: values => ({...values, [childId]: null}),
        },
        {
          path: pathToComponentDescriptor.concat(
            'localHiddenValuesById',
            nodeId,
          ),
          reducer: node => {
            const child = {
              __descriptorType: DESCRIPTOR_TYPE.REF_TO_LOCAL_HIDDEN_VALUE,
              which: childId,
            }
            const children = [].concat(node.props.children || [])
            node.props.children = [
              ...children.slice(0, atIndex),
              child,
              ...children.slice(atIndex),
            ]
            return node
          },
        },
      ]),
    )
  }

  _deleteNode = ({nodeId, parentId, index}) => {
    const {dispatch, pathToComponentDescriptor} = this.props
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat(
            'localHiddenValuesById',
            parentId,
          ),
          reducer: parentNode => {
            const children = [].concat(parentNode.props.children)
            parentNode.props.children = [
              ...children.slice(0, index),
              ...children.slice(index + 1),
            ]
            return parentNode
          },
        },
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById'),
          reducer: values => {
            const deletedNodeValue = values[nodeId]
            const idsToDelete = [].concat(nodeId)
            if (deletedNodeValue != null) {
              idsToDelete.concat(
                this._getLocalHiddenValueIdsOfSubNodes(deletedNodeValue),
              )
            }
            return _.omit(values, idsToDelete)
          },
        },
      ]),
    )
  }

  _getLocalHiddenValueIdsOfSubNodes(deletedNodeValue) {
    let ids = []
    if (deletedNodeValue.props != null) {
      ;[].concat(deletedNodeValue.props.children).forEach(c => {
        if (
          c.__descriptorType &&
          c.__descriptorType === DESCRIPTOR_TYPE.REF_TO_LOCAL_HIDDEN_VALUE
        ) {
          ids = ids.concat(c.which)
          ids = ids.concat(
            this._getLocalHiddenValueIdsOfSubNodes(
              this.props.rootComponentDescriptor.localHiddenValuesById[c.which],
            ),
          )
        }
      })
    }
    return ids
  }

  _setNodeClassValue({nodeId, value}) {
    const {dispatch, pathToComponentDescriptor} = this.props
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', nodeId),
        node => {
          node.props.class = value
          return node
        },
      ),
    )
  }

  dropHandler = (dropZoneProps: undefined | null | Object) => {
    document.styleSheets[0].removeRule(
      document.styleSheets[0].cssRules.length - 1,
    )
    const {nodeBeingDragged} = this.state
    this.setState(() => ({nodeBeingDragged: null, activeDropZone: null}))
    const {
      nodeProps: {parentId: currentParentId, index: currentIndex, id: nodeId},
      height,
      offsetY,
    } = nodeBeingDragged
    let newParentId, newIndex
    if (dropZoneProps != null) {
      newParentId = dropZoneProps.id
      newIndex =
        newParentId === currentParentId && currentIndex < dropZoneProps.index
          ? dropZoneProps.index - 1
          : dropZoneProps.index
      this._setLastAction(ACTION.NODE_MOVE, {
        id: nodeId,
        height,
        droppedAt: dropZoneProps.mouseY - offsetY,
      })
    } else {
      newParentId = currentParentId
      newIndex = currentIndex
      this._setLastAction(ACTION.NODE_MOVE_CANCEL, {id: nodeId})
    }
    this._moveNode(currentParentId, newParentId, currentIndex, newIndex)
  }

  _moveNode(
    currentParentId: string,
    newParentId: string,
    currentIndex: number,
    newIndex: number,
  ) {
    const {dispatch, pathToComponentDescriptor} = this.props
    let childToMove
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat(
            'localHiddenValuesById',
            currentParentId,
          ),
          reducer: currentParent => {
            const children = [].concat(currentParent.props.children)
            childToMove = children.splice(currentIndex, 1)
            currentParent.props.children = children
            return currentParent
          },
        },
        {
          path: pathToComponentDescriptor.concat(
            'localHiddenValuesById',
            newParentId,
          ),
          reducer: newParent => {
            const children = [].concat(newParent.props.children || [])
            newParent.props.children = [
              ...children.slice(0, newIndex),
              ...childToMove,
              ...children.slice(newIndex),
            ]
            return newParent
          },
        },
      ]),
    )
  }

  _setTypeOfComponent = ({nodeId, nodeType, newType}) => {
    const {dispatch, pathToComponentDescriptor} = this.props

    this._setLastAction(ACTION.NODE_TYPE_SET, {id: nodeId})
    this.setState(() => ({componentBeingSet: null}))
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', nodeId),
        localHiddenValue => {
          if (newType.nodeType === NODE_TYPE.TEXT) {
            return ''
          }
          if (newType.nodeType === NODE_TYPE.COMPONENT) {
            return {
              ...TreeEditor.getDefaultComponentProps(nodeId),
              ...nodeType === NODE_TYPE.COMPONENT ? localHiddenValue : {},
              componentId: this._getComponentDescriptorByDisplayName(
                newType.displayName,
              ).id,
            }
          }
        },
      ),
    )
  }

  _cancelSettingComponentType = () => {
    const {nodeProps} = this.state.componentBeingSet
    this.setState(() => ({componentBeingSet: null}))
    if (nodeProps.status === STATUS.UNINITIALIZED) {
      this._setLastAction(ACTION.NODE_ADD_CANCEL, {id: nodeProps.id})
      this._setNodes(this.props.rootComponentDescriptor)
    }
  }

  _changeNodeTextValue({nodeId, value}: {nodeId: string; value: string}) {
    const {dispatch, pathToComponentDescriptor} = this.props
    this._setLastAction(ACTION.NODE_TEXT_CHANGE, {id: nodeId})
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', nodeId),
        () => value,
      ),
    )
  }

  _startScroll = dir => {
    if (this.state.nodeBeingDragged == null) return
    const delta = dir === 'up' ? -1 : dir === 'down' ? 1 : 0
    this.scrollInterval = setInterval(() => {
      this.treeWrapper.scrollTop += 2 * delta
    }, 5)
  }

  _stopScroll = () => {
    clearInterval(this.scrollInterval)
    this.scrollInterval = null
  }

  _renderScroller(direction: 'up' | 'down') {
    return (
      <div
        className={css.scroller}
        onMouseOver={() => this._startScroll(direction)}
        onMouseLeave={() => this._stopScroll()}
      />
    )
  }

  handleTextNodeTypeChange = (id: string) => {
    this._setLastAction(ACTION.NODE_TEXT_TYPE_CHANGE, {id})
    this._setNodes(this.props.rootComponentDescriptor)
  }

  cancelTextNodeTypeChange = (id: string) => {
    this._setLastAction(ACTION.NODE_TEXT_TYPE_CHANGE_CANCEL, {id})
    this._setNodes(this.props.rootComponentDescriptor)    
  }

  render() {
    const {
      nodes,
      nodeBeingDragged,
      activeDropZone,
      selectedNodeId,
    } = this.state
    const isANodeBeingDragged = nodeBeingDragged != null

    return (
      <div>
        <PanelSection withHorizontalMargin={false} label="Template">
          {this._renderScroller('up')}
          {isANodeBeingDragged && (
            <MovableNode
              nodeBeingDragged={nodeBeingDragged}
              activeDropZone={activeDropZone}
              onCancel={this.dropHandler}
            />
          )}
          <div ref={c => (this.treeWrapper = c)} className={css.treeWrapper}>
            <div
              ref={c => (this.treeContainer = c)}
              className={css.treeContainer}
            >
              <NodeContainer
                key={nodes.id}
                selectedNodeId={selectedNodeId}
                nodeData={nodes}
                dispatchAction={this.dispatchActionFromNode}
                isANodeBeingDragged={isANodeBeingDragged}
                setNodeBeingDragged={this.setNodeBeingDragged}
                setActiveDropZone={activeDropZone =>
                  this.setState(() => ({activeDropZone}))
                }
                unsetActiveDropZone={() =>
                  this.setState(() => ({activeDropZone: null}))
                }
                setSelectedNodeId={(selectedNodeId: string) =>
                  this.setState(() => ({selectedNodeId}))
                }
                listOfDisplayNames={this.props.listOfDisplayNames}
                handleTextNodeTypeChange={this.handleTextNodeTypeChange}
                cancelTextNodeTypeChange={this.cancelTextNodeTypeChange}
              />
            </div>
          </div>
          {this._renderScroller('down')}
        </PanelSection>
      </div>
    )
  }
}

export default compose(
  connect((s, op) => {
    const componentDescriptors = _.get(s, [
      'componentModel',
      'componentDescriptors',
    ])
    const {
      core: {
        'TheaterJS/Core/RenderCurrentCanvas': rcc,
        'TheaterJS/Core/DOMTag': dt,
        ...core,
      },
      custom,
    } = componentDescriptors
    const componentTypes = Object.entries({...core, ...custom}).reduce(
      (reducer, [key, value]) => {
        reducer[key] = {
          id: key,
          displayName: value.displayName,
          type: value.type,
        }
        return reducer
      },
      {},
    )
    const listOfDisplayNames = Object.entries(componentTypes).map(
      ([, value]) => value.displayName,
    )

    return {
      componentTypes,
      listOfDisplayNames,
      getComponentDescriptor: id => getComponentDescriptor(s, id),
      rootComponentDescriptor: _.get(s, op.pathToComponentDescriptor),
    }
  }),
)(TreeEditor)
