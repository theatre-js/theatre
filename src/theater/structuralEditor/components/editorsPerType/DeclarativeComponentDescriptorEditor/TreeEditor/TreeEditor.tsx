import {
  reduceStateAction,
  multiReduceStateAction,
} from '$shared/utils/redux/commonActions'

import {getComponentDescriptor} from '$theater/componentModel/selectors'
import PanelSection from '$theater/structuralEditor/components/reusables/PanelSection'
import NodeContainer from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/NodeContainer'
import MovableNode from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/MovableNode'
import * as css from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/index.css'
import generateUniqueId from 'uuid/v4'
import * as _ from 'lodash'
import {
  DESCRIPTOR_TYPE,
  ACTION,
  STATUS_BY_ACTION,
  NODE_TYPE,
  STATUS,
} from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/constants'
import cx from 'classnames'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODES} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import StudioComponent from '$theater/handy/StudioComponent'
import React from 'react'
import connect from '$theater/handy/connect'
import { IDeclarativeComponentDescriptor } from '$theater/componentModel/types/declarative';

export const metaKey = 'composePanel'
const PLACEHOLDER = '\n'

export const getMeta = (rootComponentDescriptor: $IntentionalAny) => {
  return _.get(rootComponentDescriptor, ['meta', metaKey])
}

export const getSelectedNodeId = (
  rootComponentDescriptor: $IntentionalAny,
): undefined | null | string => {
  return _.get(getMeta(rootComponentDescriptor), 'selectedNodeId')
}

interface IOwnProps {
  pathToComponentDescriptor: string[]
  rootComponentDescriptor: IDeclarativeComponentDescriptor
}

interface IProps extends IOwnProps {}

type State = {
  nodes: Object
  isCommandDown: boolean
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
}

const getDefaultComponentProps = (id: string) => ({
  __descriptorType: DESCRIPTOR_TYPE.COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR,
  props: {
    key: id,
    children: [],
  },
  modifierInstantiationDescriptors: {
    byId: {
      '1': {
        __descriptorType: 'ModifierInstantiationValueDescriptor',
        modifierId: 'TheaterJS/Core/HTML/UberModifier',
        props: {
          translationX: '0',
          translationY: '0',
          translationZ: '0',
          opacity: '1',
          scaleX: '1',
          scaleY: '1',
          scaleZ: '1',
          rotateX: '0',
          rotateY: '0',
          rotateZ: '0',
        },
        enabled: true,
      },
    },
    list: ['1'],
  },
})

class TreeEditor extends StudioComponent<IProps, State> {
  lastAction = {type: null, payload: null}
  queuedDrop = null
  state = {
    nodes: {},
    isCommandDown: false,
    nodeBeingDragged: null,
    selectedNodeId: null,
    componentBeingSet: null
  }

  componentDidMount() {
    this._setNodes(this.props.rootComponentDescriptor)
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (
      !_.isEqual(
        nextProps.rootComponentDescriptor.localHiddenValuesById,
        this.props.rootComponentDescriptor.localHiddenValuesById,
      ) ||
      this.lastAction.type != null
    ) {
      this._setNodes(nextProps.rootComponentDescriptor)
    }
  }

  _setLastAction(type: string, payload: Object) {
    this.lastAction = {type, payload}
  }

  _unsetLastAction() {
    this.lastAction = {type: null, payload: null}
  }

  _setQueuedDrop(dropPayload: $FixMe) {
    this.queuedDrop = {...dropPayload}
  }

  _unsetQueuedDrop() {
    this.queuedDrop = null
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
    parentPath: string[] = [],
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
          ...(actionPayload != null ? {actionPayload} : {}),
          index,
          parentId,
          path: parentPath,
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
          ...(actionPayload != null ? {actionPayload} : {}),
          type: NODE_TYPE.TEXT,
          value: descriptor === PLACEHOLDER ? '' : descriptor,
          index,
          parentId,
          path: parentPath,
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
          ...(actionPayload != null ? {actionPayload} : {}),
          type: NODE_TYPE.COMPONENT,
          componentType,
          displayName,
          class: descriptor.props.class || '',
          index,
          parentId,
          path: parentPath,
          children: []
            .concat(descriptor.props.children || [])
            .map((c, i) =>
              this._getComponentData(
                c,
                localHiddenValuesById,
                i,
                id,
                parentPath.concat('children', `${i}`),
              ),
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
    document.body.classList.add('globalNoDropCursor')

    this.setState(() => ({nodeBeingDragged}))
  }

  dispatchActionFromNode = (actionType: string, payload: Object) => {
    switch (actionType) {
      case ACTION.NODE_ADD:
        this._addChildToNode(payload)
        break
      case ACTION.NODE_MOVE:
        this._setQueuedDrop(payload)
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
    this.setSelectedNodeId(childId)
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
            if (children[index] && children[index].which === nodeId) {
              parentNode.props.children = [
                ...children.slice(0, index),
                ...children.slice(index + 1),
              ]
            }
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

  handleDragEnd = () => {
    document.body.classList.remove('globalNoDropCursor')

    const dropPayload: $FixMe = this.queuedDrop
    this._unsetQueuedDrop()
    // console.log(dropPayload)
    let nodeBeingDragged
    this.setState((state: $FixMe) => {
      ;({nodeBeingDragged} = state)
      return {nodeBeingDragged: null}
    })

    const {nodeProps, height, offsetY, offsetX} = nodeBeingDragged
    const {
      parentId: currentParentId,
      index: currentIndex,
      id: nodeId,
    } = nodeProps
    let newParentId: string, newIndex: number
    if (dropPayload != null) {
      const {index: dropIndex} = dropPayload
      newParentId = dropPayload.id
      newIndex =
        newParentId === currentParentId && currentIndex < dropIndex
          ? dropIndex - 1
          : dropIndex
      this._setLastAction(ACTION.NODE_MOVE, {
        id: nodeId,
        height,
        originalWidth: nodeBeingDragged.width,
        targetWidth: dropPayload.targetWidth,
        dropOffset: {
          x: dropPayload.mouseX - offsetX - dropPayload.targetLeft,
          y: dropPayload.mouseY - offsetY - dropPayload.targetTop,
        },
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
          reducer: (currentParent: $FixMe) => {
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
          reducer: (newParent: $FixMe) => {
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
            return PLACEHOLDER
          }
          if (newType.nodeType === NODE_TYPE.COMPONENT) {
            return {
              ...getDefaultComponentProps(nodeId),
              ...(nodeType === NODE_TYPE.COMPONENT ? localHiddenValue : {}),
              componentId: this._getComponentDescriptorByDisplayName(
                newType.displayName,
              ).id,
            }
          }
        },
      ),
    )
  }

  _cancelSettingComponentType = (
    nodeProps = this.state.componentBeingSet.nodeProps,
  ) => {
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
    const maxScroll =
      this.treeContainer.scrollHeight - this.treeWrapper.clientHeight
    const coeffGenerator =
      dir === 'up'
        ? (scroll: number) => {
            return scroll > 100 ? 1 : 1 - Math.pow(1 - scroll / 100, 1.4)
          }
        : (scroll: number) => {
            return maxScroll - scroll > 100
              ? 1
              : 1 - Math.pow(1 - (maxScroll - scroll) / 100, 1.4)
          }
    let scroll = this.treeWrapper.scrollTop
    this.scrollInterval = setInterval(() => {
      scroll += parseFloat((coeffGenerator(scroll) * delta * 3.5).toFixed(1))
      this.treeWrapper.scrollTop = scroll
    }, 5)
  }

  _stopScroll = () => {
    clearInterval(this.scrollInterval)
    this.scrollInterval = null
  }

  _renderScroller(direction: 'up' | 'down') {
    return (
      <div
        className={cx(css.scroller, {
          [css.top]: direction === 'up',
          [css.bottom]: direction === 'down',
        })}
        onMouseOver={() => this._startScroll(direction)}
        onMouseLeave={() => this._stopScroll()}
      />
    )
  }

  handleTextNodeTypeChange = (id: string) => {
    this._setLastAction(ACTION.NODE_TEXT_TYPE_CHANGE, {id})
    this._setNodes(this.props.rootComponentDescriptor)
    this.setSelectedNodeId(id)
  }

  cancelTextNodeTypeChange = (id: string) => {
    this._setLastAction(ACTION.NODE_TEXT_TYPE_CHANGE_CANCEL, {id})
    this._setNodes(this.props.rootComponentDescriptor)
  }

  updateMeta = (updateFn: (l: {}) => {}) => {
    const oldMeta = getMeta(this.props.rootComponentDescriptor)
    const newMeta = {...oldMeta, ...updateFn(oldMeta)}
    this.reduceState(
      [...this.props.pathToComponentDescriptor, 'meta', metaKey],
      () => newMeta,
    )
  }

  setSelectedNodeId = (selectedNodeId: string | null) => {
    this.updateMeta(() => ({selectedNodeId}))
  }

  render() {
    const {nodes, nodeBeingDragged} = this.state
    const isANodeBeingDragged = nodeBeingDragged != null
    const selectedNodeId = getSelectedNodeId(this.props.rootComponentDescriptor)

    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {({activeMode}) => {
          return (
            <PanelSection
              withHorizontalMargin={false}
              withoutBottomMargin={true}
              label="Template"
            >
              {this._renderScroller('up')}
              {isANodeBeingDragged && (
                <MovableNode
                  rootNode={_.get(nodes, nodeBeingDragged.nodeProps.path)}
                  nodeBeingDragged={nodeBeingDragged}
                  onDragEnd={this.handleDragEnd}
                />
              )}
              <div
                ref={c => (this.treeWrapper = c)}
                className={css.treeWrapper}
              >
                <div
                  ref={c => (this.treeContainer = c)}
                  className={css.treeContainer}
                >
                  <NodeContainer
                    key={nodes.id}
                    isCommandDown={activeMode === MODES.cmd}
                    selectedNodeId={selectedNodeId}
                    nodeData={nodes}
                    dispatchAction={this.dispatchActionFromNode}
                    isANodeBeingDragged={isANodeBeingDragged}
                    setNodeBeingDragged={this.setNodeBeingDragged}
                    setSelectedNodeId={this.setSelectedNodeId}
                    listOfDisplayNames={this.props.listOfDisplayNames}
                    handleTextNodeTypeChange={this.handleTextNodeTypeChange}
                    cancelTextNodeTypeChange={this.cancelTextNodeTypeChange}
                    cancelSettingType={this._cancelSettingComponentType}
                  />
                </div>
              </div>
              {this._renderScroller('down')}
            </PanelSection>
          )
        }}
      </Subscriber>
    )
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  const {
    'TheaterJS/Core/RenderCurrentCanvas': rcc,
    'TheaterJS/Core/DOMTag': dt,
    ...core
  } = s.ahistoricComponentModel.coreComponentDescriptors
  const custom = s.historicComponentModel.customComponentDescriptors
  const componentTypes = Object.entries({...core, ...custom}).reduce(
    (reducer, [key, value]) => {
      if (!value.isScene) {
        reducer[key] = {
          id: key,
          displayName: value.displayName,
          type: value.type,
        }
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
    // selectedNodeId,
  }
})(TreeEditor)
