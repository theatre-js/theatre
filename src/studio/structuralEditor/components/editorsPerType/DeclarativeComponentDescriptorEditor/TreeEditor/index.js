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
import ComponentSelector from './ComponentSelector'
import css from './index.css'
import generateUniqueId from 'uuid/v4'
import * as _ from 'lodash'
import cx from 'classnames'

type Props = {
  pathToComponentDescriptor: Array<string>,
  rootComponentDescriptor: Object,
  dispatch: Function,
}

type State = {
  nodes: Object,
  nodeBeingDragged: ?{
    nodeProps: Object,
    depth: number,
    top: number,
    height: number,
    offsetY: number,
  },
  activeDropZone: ?{
    id: string,
    index: number,
    depth: number,
  },
  componentBeingChanged: ?{
    nodeProps: Object,
    depth: number,
    top: number,
    left: number,
    width: number,
  },
  deltaScroll: number,
}

const REF_TO_LOCAL_HIDDEN_VALUE = 'ReferenceToLocalHiddenValue'
const COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR = 'ComponentInstantiationValueDescriptor'
const CHANGE_TYPE = 'CHANGE_TYPE'
export const CHILD_ADD = 'CHILD_ADD'
export const NODE_MOVE = 'NODE_MOVE'
export const NODE_MOVE_CANCEL = 'NODE_MOVE_CANCEL'
export const COMPONENT = 'COMPONENT'
export const TEXT = 'TEXT'
export const UNCHANGED = 'UNCHANGED'
export const CREATED = 'CREATED'
export const TYPE_CHANGED = 'TYPE_CHANGED'
export const RELOCATED = 'RELOCATED'
export const RELOCATION_CANCELED = 'RELOCATION_CANCELED'
const STATUS = {
  DEFAULT: UNCHANGED,
  CHILD_ADD: CREATED,
  NODE_MOVE: RELOCATED,
  NODE_MOVE_CANCEL: RELOCATION_CANCELED,
  CHANGE_TYPE: TYPE_CHANGED,
}

class TreeEditor extends React.PureComponent<Props, State> {
  unsetDropZoneTimeout = null
  lastAction = {type: null, payload: null}
  state = {
    nodes: {},
    nodeBeingDragged: null,
    activeDropZone: null,
    componentBeingChanged: null,
    deltaScroll: 0,
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
      rootComponentDescriptor.whatToRender.__descriptorType === REF_TO_LOCAL_HIDDEN_VALUE
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
    parentId: ?string = null,
  ): Object {
    const {getComponentDescriptor} = this.props

    let data = {}
    if (descriptor.__descriptorType != null) {
      let which
      while (descriptor.__descriptorType === REF_TO_LOCAL_HIDDEN_VALUE) {
        which = descriptor.which
        descriptor = localHiddenValuesById[which]
      }

      if (descriptor.__descriptorType === COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR) {
        const {type: componentType, displayName: displayName} = getComponentDescriptor(
          descriptor.componentId,
        )

        const id = descriptor.props.key
        const {status, actionPayload} = this._getComponentStatusAndActionPayload(id)
        data = {
          id,
          status: status,
          ...(actionPayload != null ? {actionPayload} : {}),
          type: COMPONENT,
          componentType,
          displayName,
          index,
          parentId,
          children: []
            .concat(descriptor.props.children || [])
            .map((c, i) => this._getComponentData(c, localHiddenValuesById, i, id)),
        }
      }

      if (typeof descriptor === 'string') {
        const {status, actionPayload} = this._getComponentStatusAndActionPayload(which)
        data = {
          id: which,
          status: status,
          ...(actionPayload != null ? {actionPayload} : {}),
          type: TEXT,
          value: descriptor,
          index,
          parentId,
        }
      }
    }

    return data
  }

  _getComponentStatusAndActionPayload(
    id: string,
  ): {stauts: string, actionPayload: ?Object} {
    let status = STATUS.DEFAULT,
      actionPayload
    if (this.lastAction.payload != null && this.lastAction.payload.id === id) {
      const {id, ...payload} = this.lastAction.payload
      status = STATUS[this.lastAction.type]
      actionPayload = payload
    }
    return {status, actionPayload}
  }

  setNodeBeingDragged = nodeBeingDragged => {
    document.styleSheets[0].insertRule(
      '* {cursor: -webkit-grab !important;}',
      document.styleSheets[0].cssRules.length,
    )

    const maxScroll =
      this.treeContainer.clientHeight -
      this.treeWrapper.clientHeight -
      nodeBeingDragged.height +
      30
    this.setState(() => ({
      nodeBeingDragged,
      shouldStretch: true,
      maxScroll,
    }))
  }

  dispatchAction = (actionType: string, payload: Object) => {
    switch (actionType) {
      case CHILD_ADD: {
        const id = this._addChildToNode(payload)
        this._setLastAction(CHILD_ADD, {id})
        break
      }
      case NODE_MOVE: {
        this.dropHandler(payload)
        break
      }
      case CHANGE_TYPE: {
        this._changeTypeOfComponent(payload)
        break
      }
      default:
        throw Error('This should never happen!')
    }
  }

  _addChildToNode({nodeId, atIndex}: {nodeId: string, atIndex: number}): string {
    const {dispatch, pathToComponentDescriptor} = this.props
    const childId = generateUniqueId()
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById'),
          reducer: values => {
            const child = {
              __descriptorType: COMPONENT_INSTANTIATION_VALUE_DESCRIPTOR,
              componentId: 'TheaterJS/Core/HTML/div',
              props: {
                key: childId,
                children: [],
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
          path: pathToComponentDescriptor.concat('localHiddenValuesById', nodeId),
          reducer: node => {
            const child = {
              __descriptorType: REF_TO_LOCAL_HIDDEN_VALUE,
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
    return childId
  }

  dropHandler = (dropZoneProps: ?Object) => {
    document.styleSheets[0].removeRule(document.styleSheets[0].cssRules.length - 1)
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
      this._setLastAction(NODE_MOVE, {
        id: nodeId,
        height,
        droppedAt: dropZoneProps.mouseY - offsetY,
      })
    } else {
      newParentId = currentParentId
      newIndex = currentIndex
      this._setLastAction(NODE_MOVE_CANCEL, {id: nodeId})
    }
    this._moveNode(currentParentId, newParentId, currentIndex, newIndex)

    setTimeout(() => {
      this.setState(() => ({shouldStretch: false, deltaScroll: 0}))
    }, 500)
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
          path: pathToComponentDescriptor.concat('localHiddenValuesById', newParentId),
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

  _startScroll = dir => {
    if (this.state.nodeBeingDragged == null) return
    const delta = dir === 'up' ? -1 : dir === 'down' ? 1 : 0
    const {maxScroll: stateMaxScroll} = this.state
    const maxScroll = {
      up: Math.max(this.treeWrapper.scrollTop, stateMaxScroll),
      down: stateMaxScroll,
    }
    this.scrollInterval = setInterval(() => {
      const scrollTop = this.treeWrapper.scrollTop
      const scrollTo = parseInt(_.clamp(scrollTop + delta, 0, maxScroll[dir]))
      if (scrollTop !== scrollTo) {
        this.treeWrapper.scrollTop = scrollTo
        this.setState(state => ({deltaScroll: state.deltaScroll + delta}))
      }
    }, 5)
  }

  _changeTypeOfComponent({displayName}) {
    const {dispatch, pathToComponentDescriptor} = this.props
    const {id} = this.state.componentBeingChanged.nodeProps
    const newComponentId = Object.values(this.props.componentTypes).find(
      c => c.displayName === displayName,
    ).id

    this._setLastAction(CHANGE_TYPE, {id})
    this.setState(() => ({componentBeingChanged: null}))

    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        localHiddenValue => {
          return {...localHiddenValue, componentId: newComponentId}
        },
      ),
    )
  }

  _stopScroll = () => {
    clearInterval(this.scrollInterval)
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

  render() {
    const {
      nodes,
      nodeBeingDragged,
      activeDropZone,
      componentBeingChanged,
      shouldStretch,
    } = this.state

    const isANodeBeingDragged = nodeBeingDragged != null
    return (
      <div>
        <PanelSection withHorizontalMargin={false} label="Template">
          {componentBeingChanged != null && (
            <ComponentSelector
              nodeProps={componentBeingChanged}
              listOfDisplayNames={Object.entries(this.props.componentTypes).map(
                ([, value]) => value.displayName,
              )}
              onSelect={displayName => this.dispatchAction(CHANGE_TYPE, {displayName})}
            />
          )}
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
              className={cx(css.treeContainer, {
                [css.stretch]: shouldStretch,
              })}
            >
              <NodeContainer
                key={nodes.id}
                nodeData={nodes}
                dispatchAction={this.dispatchAction}
                isANodeBeingDragged={isANodeBeingDragged}
                setNodeBeingDragged={this.setNodeBeingDragged}
                setActiveDropZone={activeDropZone =>
                  this.setState(() => ({activeDropZone}))
                }
                unsetActiveDropZone={() => this.setState(() => ({activeDropZone: null}))}
                setComponentBeingChanged={componentBeingChanged =>
                  this.setState(() => ({componentBeingChanged}))
                }
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
    const componentDescriptors = _.get(s, ['componentModel', 'componentDescriptors'])
    // const listOfComponents = Object.entries(componentDescriptors.core)
    //   .filter(
    //     ([key]) =>
    //       key !== 'TheaterJS/Core/RenderCurrentCanvas' && key !== 'TheaterJS/Core/DOMTag',
    //   )
    //   .concat(Object.entries(componentDescriptors.custom))
    //   .map(([key, value]) => ({
    //     id: key,
    //     displayName: value.displayName,
    //     type: value.type,
    //   }))

    // const listOfComponents = Object.keys(componentDescriptors.core).filter(key => key !== 'TheaterJS/Core/RenderCurrentCanvas' && key !== 'TheaterJS/Core/DOMTag')
    const {
      core: {
        'TheaterJS/Core/RenderCurrentCanvas': rcc,
        'TheaterJS/Core/DOMTag': dt,
        ...core
      },
      custom,
    } = componentDescriptors
    // const _componentTypes = {...core, ...custom}
    // const componentTypes = Object.keys(_componentTypes).reduce((reducer, key) => {
    //   const value = _componentTypes[key]
    //   reducer[value.displayName] = value
    //   return reducer
    // }, {})
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

    return {
      componentTypes,
      getComponentDescriptor: id => getComponentDescriptor(s, id),
      rootComponentDescriptor: _.get(s, op.pathToComponentDescriptor),
    }
  }),
)(TreeEditor)
