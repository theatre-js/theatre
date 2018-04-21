import {
  Hook,
  AnyFn,
  RendererId,
  Helpers,
  ReactRenderer,
  DataType,
  OpaqueNodeHandle,
} from './types'
import uuid from 'uuid/v4'
import mitt, {Emitter} from 'mitt'
import Stack from '$shared/utils/Stack'
import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'
import update from 'lodash/fp/update'
import {omit, pull, pickBy} from 'lodash'

// if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
//   const installReactDevtoolsGlobalHook = require('$root/vendor/react-devtools-backend/installGlobalHook')
//   installReactDevtoolsGlobalHook(window)
// }

/**
 * setupBackend()'s output cannot safely be consumed by two or more consumers. Thus,
 * we'll need to write one for outselves.
 */
// const setupBackend = require('$root/vendor/react-devtools-backend/backend')
// setupBackend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

export type VolatileId = string

const PARENT_ID_UNKOWN = undefined
const PARENT_ID_ROOT = 'PARENT_ID_ROOT'

/**
 * All nodes have a volatileId, a rendererID, and with the exception
 * of WrapperNode, a parentVolatileId
 */
type StuffMostNodesHaveInCommon = {
  volatileId: VolatileId
  parentVolatileId: typeof PARENT_ID_UNKOWN | string
  rendererId: RendererId
}

/**
 * All native elements (eg <div>, <a>, etc) and all custom
 * elements (eg <MyButton>) are recorded as GeneralNode.
 */
export type GenericNode = StuffMostNodesHaveInCommon & {
  type: 'Generic'
  nativeNode: Element | React.Component<mixed, mixed>
  reactSpecific: {
    internalData: DataType
    internalInstance: OpaqueNodeHandle
  }
  volatileIdsOfChildren: Array<VolatileId>
}

type ReactSpecificStuff = {
  internalData: DataType
  internalInstance: OpaqueNodeHandle
}

/**
 * WrapperNode is at the very top of every react tree
 */
export type WrapperNode = {
  type: 'Wrapper'
  volatileId: VolatileId
  rendererId: RendererId
  reactSpecific: ReactSpecificStuff
  volatileIdsOfChildren: Array<VolatileId>
  parentVolatileId: typeof PARENT_ID_UNKOWN | typeof PARENT_ID_ROOT | string
}

export type TextNode = StuffMostNodesHaveInCommon & {
  type: 'Text'
  reactSpecific?: ReactSpecificStuff
  text: string
}

export type Node = GenericNode | TextNode | WrapperNode

export const isGenericNode = (n: Node): n is GenericNode => {
  return n.type === 'Generic'
}

export const isWrapperNode = (n: Node): n is WrapperNode => {
  return n.type === 'Wrapper'
}

export const isTextNode = (n: Node): n is TextNode => {
  // @ts-ignore @todo
  return n.type === 'Text'
}

export type State = {
  renderers: {[rendererId: string]: Renderer}
  nodesByVolatileId: {[volatileId: string]: Node}
}

interface Renderer {
  rendererId: RendererId
  renderer: ReactRenderer
  helpers: Helpers
  volatileIdsOfRootNodes: VolatileId[]
}

export default class MirrorOfReactTree {
  _bufferedEvents: Array<$FixMe>;
  events: Emitter
  // All the subscriptions to _hook.sub(). We'll call all of thsese on #cleanup()
  _subscriptions: AnyFn[]
  // reference to __REACT_DEVTOOLS_GLOBAL_HOOK__
  _hook: Hook
  /**
   * each 'mount/unmount/update' event coming from devtools comes with a property
   * called 'internalInstance'. internalInstance tends to remain the same for each
   * element through mount/unmount/update(s). We use this face to assign a unique
   * id to each internalInstance, hence assigning a unique id to each element.
   */
  _volatileIdsByInternalInstances: WeakMap<OpaqueNodeHandle, VolatileId>
  _volatileIdsByStateNodes: WeakMap<$FixMe, VolatileId>
  // atom: Atom<State>
  state: State
  _rendererInterestedIn: RendererId | undefined

  constructor() {
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
      throw new Error(
        `__REACT_DEVTOOLS_GLOBAL_HOOK__ not found. This should never happen`,
      )

    this.events = new mitt()
    this._hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    this._subscriptions = []
    // this.atom = atom()
    this.state = {
      renderers: {},
      nodesByVolatileId: {},
    }
    this._volatileIdsByInternalInstances = new WeakMap()
    this._volatileIdsByStateNodes = new WeakMap()
    this._bufferedEvents = []

    this._setup()
  }

  discardAllRenderersExcept(rendererId: RendererId) {
    if (
      this._rendererInterestedIn &&
      this._rendererInterestedIn !== rendererId
    ) {
      throw new Error(
        `We're already discarding renderer '${
          this._rendererInterestedIn
        }'. Can't discard another renderer again`,
      )
    }

    this._rendererInterestedIn = rendererId
    const oldState = this.getState()
    const newState = {
      renderers: pickBy(oldState.renderers, r => r.rendererId === rendererId),
      nodesByVolatileId: pickBy(
        oldState.nodesByVolatileId,
        r => r.rendererId === rendererId,
      ),
    }
    this._replaceState(() => newState as $FixMe)
  }

  private _replaceState(fn: (old: State) => State) {
    this.state = fn(this.state)
  }

  getState() {
    return this.state
  }

  private _reduceState: PathBasedReducer<State, void> = (
    path: $IntentionalAny[],
    reducer: Function,
  ) => {
    this._replaceState(oldState => update(path, reducer, oldState))
  }

  _getRenderer(id: RendererId): Renderer {
    return this.state.renderers[id]
  }

  _setRenderer(id: RendererId, r: Renderer) {
    this._reduceState(['renderers', id], () => r)
  }

  _setup() {
    this._subscriptions.push(
      this._hook.sub('root', this._bufferEvent),
      this._hook.sub('mount', this._bufferEvent),
      this._hook.sub('unmount', this._bufferEvent),
      this._hook.sub('update', this._bufferEvent),
      this._hook.sub(
        'renderer-attached',
        ({id: rendererId, helpers, renderer}) =>
        this._bufferEvent({rendererId, helpers, renderer, type: 'renderer-attached'})
      ),
    )

    for (const rendererId in this._hook.helpers) {
      const renderer = this._hook._renderers[rendererId]
      const helpers = this._hook.helpers[rendererId]
      this._bufferEvent({rendererId, helpers, renderer, type: 'renderer-attached'})
    }
  }

  _bufferEvent = (eventData: $FixMe) => {
    this._bufferedEvents.push(eventData)
  }

  flushEvents() {
    while (true) {
      const event = this._bufferedEvents.shift()
      if (!event) return
      const {type} = event
      if (type === 'mount') {
        this._reactToMount(event)
      } else if (type === 'unmount') {
        this._reactToUnmount(event)
      } else if (type === 'update') {
        this._reactToUpdate(event)
      } else if (type === 'root') {
        this._reactToRoot(event)
      } else if (type === 'renderer-attached') {
        this._reactToRendererAttached(event)
      } else {
        debugger
        throw new Error(`Unkown event type '${type}'`)
      }
    }
  }

  _cleanup() {
    const subs = this._subscriptions
    this._subscriptions = []
    subs.forEach(fn => fn())
    this._reduceState(['renderers'], () => ({}))
    this._reduceState(['nodesByVolatileId'], () => ({}))
  }

  _getOrAssignVolatileIdFromInternalInstance(
    internalInstance: OpaqueNodeHandle,
  ): VolatileId {
    const possibleVolatileId = this._getVolatileIdFromInternalInstance(
      internalInstance,
    )

    if (!possibleVolatileId) {
      let volatileID: string
      const {stateNode} = internalInstance as $FixMe
      if (stateNode && this._volatileIdsByStateNodes.has(stateNode)) {
        volatileID = this._volatileIdsByStateNodes.get(stateNode) as string
      } else {
        volatileID = uuid()
      }
      this._volatileIdsByInternalInstances.set(internalInstance, volatileID)
      return volatileID
    } else {
      return possibleVolatileId
    }
  }

  assignEarlyVolatileIdToComponentInstance(componentInstance: mixed) {
    const volatileId = uuid()
    this._volatileIdsByStateNodes.set(componentInstance, volatileId)
    return volatileId
  }

  _reactToMount = ({
    internalInstance,
    data,
    renderer: rendererId,
    ...rest
  }: {
    internalInstance: OpaqueNodeHandle
    data: DataType
    renderer: RendererId
    type: 'mount'
  }) => {
    if (this._rendererInterestedIn && this._rendererInterestedIn !== rendererId)
      return

    if (rest.type !== 'mount') {
      // @todo
      throw new Error(`type is ${rest.type}. Investigate`)
    }

    const volatileId = this._getOrAssignVolatileIdFromInternalInstance(
      internalInstance,
    )
    const {nodeType} = data
    if (nodeType === 'Text') {
      this._reactToTextNodeMount(volatileId, data, internalInstance, rendererId)
    } else if (
      nodeType === 'Native' ||
      nodeType === 'Composite' ||
      nodeType === 'Wrapper'
    ) {
      this._reactToGenericOrWrapperNodeMount(
        data,
        volatileId,
        rendererId,
        internalInstance,
      )
    } else {
      debugger
      throw new Error('Implement me')
    }
  }

  _reactToUnmount = ({
    internalInstance,
    renderer: rendererId,
  }: {
    internalInstance: OpaqueNodeHandle
    renderer: RendererId
  }) => {
    if (this._rendererInterestedIn && this._rendererInterestedIn !== rendererId)
      return

    const volatileId = this._getVolatileIdFromInternalInstance(internalInstance)

    if (!volatileId) {
      throw new Error(
        `Got an 'unmount' with internalInstance that doesn't have a volatileId`,
      )
    }
    const node = this.getNodeByVolatileId(volatileId) as Node

    if (isGenericNode(node) || isWrapperNode(node)) {
      if (node.volatileIdsOfChildren.length !== 0) {
        const childNodeVid = node.volatileIdsOfChildren[0]
        const childNode = this.getNodeByVolatileId(childNodeVid) as Node
        if (
          node.volatileIdsOfChildren.length === 1 &&
          childNode.type === 'Text' &&
          !childNode.reactSpecific
        ) {
          this._deleteNode(childNodeVid)
        } else {
          throw new Error(
            `Got an unmount for a node that still has volatileIdsOfChildren. This should never happen`,
          )
        }
      }
    }

    const parentVolatileId: VolatileId | undefined = node.parentVolatileId

    if (isWrapperNode(node) && parentVolatileId === PARENT_ID_ROOT) {
      this._reduceState(
        ['renderers', node.rendererId, 'volatileIdsOfRootNodes'],
        ids => {
          return pull(ids, node.volatileId)
        },
      )
    } else {
      if (!parentVolatileId) {
        throw new Error(
          `Got an unmount for a node that doesn't have a parentVolatileId`,
        )
      }

      const parentNode = this.getNodeByVolatileId(parentVolatileId) as
        | WrapperNode
        | GenericNode
        | undefined

      if (!parentNode) {
        throw new Error(
          `Got an unmount for a node whose parent has been deregistered`,
        )
      }

      this._reduceState(
        ['nodesByVolatileId', parentNode.volatileId, 'volatileIdsOfChildren'],
        (ids: VolatileId[]) => pull(ids, volatileId),
      )
    }

    this._deleteNode(volatileId)
    this.events.emit('unmount', node)
  }

  /**
   * @todo We are doing way too mcuh in the update hook. It will surely slow things down
   * whenever a react element gets updated. (It actually did slow Studio UI down, but since
   * the UI is on a separate RendererId, I easily fixed it with `this.discardAllRenderersExcept()).
   * But any animation that goes through normal react lifecycle and causes an `update` event here
   * will be slowed down.
   */
  _reactToUpdate = ({
    internalInstance,
    data,
    renderer: rendererId,
    ...rest
  }: {
    internalInstance: OpaqueNodeHandle
    data: DataType
    renderer: RendererId
    type: 'update'
  }) => {
    if (this._rendererInterestedIn && this._rendererInterestedIn !== rendererId)
      return

    if (rest.type !== 'update') {
      throw new Error(`type is ${rest.type}. Investigate`)
    }

    const {nodeType} = data
    if (
      nodeType === 'Native' ||
      nodeType === 'Composite' ||
      nodeType === 'Wrapper'
    ) {
      // @todo 'Wrapper' case isn't fully tested
      this._reactToGenericOrWrapperUpdate(internalInstance, data, rendererId)
    } else if (nodeType === 'Text') {
      this._reactToTextUpdate(internalInstance, data)
    } else {
      debugger
    }
  }

  _reduceNode<NodeType, Cb extends ((n: NodeType) => NodeType)>(
    volatileId: VolatileId,
    cb: Cb,
  ): NodeType {
    let newNode
    this._reduceState(['nodesByVolatileId', volatileId], oldNode => {
      newNode = cb(oldNode as $IntentionalAny)
      // if (Object.keys(newNode).length === 1) debugger
      if (!newNode) debugger
      return newNode as $IntentionalAny
    })
    return newNode as $IntentionalAny
  }

  _reactToTextUpdate = (
    internalInstance: OpaqueNodeHandle,
    internalData: DataType,
    // rendererId: RendererId,
  ) => {
    const volatileId = this._volatileIdsByInternalInstances.get(
      internalInstance,
    )
    if (!volatileId) {
      throw new Error(
        `Got an 'update' for an internalIsntance that doesn't have a volatileId. This should never happen`,
      )
    }
    const newNode = this._reduceNode(volatileId, n => ({
      ...n,
      reactSpecific: {
        internalData,
        internalInstance,
      },
      text: internalData.text as string,
    }))

    this.events.emit('update', newNode)
  }
  _reactToGenericOrWrapperUpdate = (
    internalInstance: OpaqueNodeHandle,
    internalData: DataType,
    rendererId: RendererId,
  ) => {
    const volatileId = this._volatileIdsByInternalInstances.get(
      internalInstance,
    )
    if (!volatileId) {
      throw new Error(
        `Got an 'update' for an internalIsntance that doesn't have a volatileId. This should never happen`,
      )
    }

    const oldNode = this.getNodeByVolatileId(volatileId) as
      | GenericNode
      | WrapperNode
    // const oldNodeStuff = {
    //   volatileIdsOfChildren: oldNode.prop('volatileIdsOfChildren').unbox(),
    //   internalData: oldReactSpecificStuff.internalData,
    // }
    // this.events.emit('update', oldNode)

    if (
      oldNode.type !== 'Wrapper' &&
      oldNode.nativeNode !== internalData.publicInstance
    ) {
      debugger
      throw new Error(
        `The public instance of a node changed during update. Violates current assumptions.`,
      )
    }

    let newNode = {
      ...oldNode,
      reactSpecific: {...oldNode.reactSpecific, internalData},
    }

    if (Array.isArray(internalData.children)) {
      if (typeof oldNode.reactSpecific.internalData.children === 'string') {
        this._deleteNode(oldNode.volatileIdsOfChildren[0])
      }
      const volatileIdsOfChildren: VolatileId[] = internalData.children.map(
        childInternalInstance => {
          const childVolatileId = this._getVolatileIdFromInternalInstance(
            childInternalInstance,
          )

          if (!childVolatileId) {
            throw new Error(`Got a child that isn't already registered`)
          }
          return childVolatileId
        },
      )

      volatileIdsOfChildren.forEach((childVolatileId: VolatileId) => {
        this._reduceNode(childVolatileId, n => ({
          ...n,
          parentVolatileId: volatileId,
        }))
      })

      newNode.volatileIdsOfChildren = volatileIdsOfChildren
    } else if (typeof internalData.children === 'string') {
      if (typeof oldNode.reactSpecific.internalData.children === 'string') {
        const oldChildVolatileId = oldNode.volatileIdsOfChildren[0]
        this._reduceNode(
          oldChildVolatileId,
          n => ({...n, text: internalData.children} as TextNode),
        )
      } else {
        const newTextNode: TextNode = {
          type: 'Text' as 'Text',
          volatileId: uuid(),
          parentVolatileId: volatileId,
          text: internalData.children,
          rendererId,
        }
        this._reduceNode(newTextNode.volatileId, () => newTextNode)
        this.events.emit('mount', newTextNode)

        newNode.volatileIdsOfChildren = [newTextNode.volatileId]
      }
    } else {
      debugger
      throw new Error(`Handle this case`)
    }
    this._reduceNode(volatileId, () => newNode)
    this.events.emit('update', newNode)
  }

  _reactToRendererAttached = ({
    rendererId,
    renderer,
    helpers,
  }: {
    rendererId: RendererId
    renderer: ReactRenderer
    helpers: Helpers
  }) => {
    this._setRenderer(rendererId, {
      rendererId,
      renderer,
      helpers,
      volatileIdsOfRootNodes: [],
    })
    /**
     * Calling helpers.walkTree() causes `mount` events to be fired for all the mounted elements.
     * These `mount` events _may_ have been called before MirrorOfReactTree was instantiated, so
     * we might have just missed them, but calling walkTree causes them to be fired again so we
     * don't miss any.
     */
    // @ts-ignore @todo With ReactFiber, helpers.walkTree() don't need any argumetns. If we want
    // to support an older version of React, then we should provide those argumetns
    helpers.walkTree()
  }

  private _deleteNode(volatileId: string) {
    this._reduceState(['nodesByVolatileId'], nodes => omit(nodes, [volatileId]))
  }

  private _getVolatileIdFromInternalInstance(
    internalInstance: OpaqueNodeHandle,
  ): VolatileId | undefined {
    if (typeof internalInstance !== 'object' || !internalInstance) {
      debugger
      throw new Error('handle this case')
      // return internalInstance;
    }
    const possibleVolatileId = this._volatileIdsByInternalInstances.get(
      internalInstance,
    )
    return possibleVolatileId
  }

  private _reactToGenericOrWrapperNodeMount(
    data: DataType,
    volatileId: VolatileId,
    rendererId: RendererId,
    internalInstance: OpaqueNodeHandle,
  ) {
    let volatileIdsOfChildren: VolatileId[]

    /**
     * Since `mount` events are usually called bottom-up (first children, then parents),
     * children's parents are initially unkown when they're mounted. So, if this node has
     * children, we should assign their parent id to this node's id
     */
    if (Array.isArray(data.children)) {
      volatileIdsOfChildren = data.children.map(childInternalInstance =>
        this._getOrAssignVolatileIdFromInternalInstance(childInternalInstance),
      )

      volatileIdsOfChildren.forEach((childVolatileId: VolatileId) => {
        this._reduceNode(childVolatileId, n => ({
          ...n,
          parentVolatileId: volatileId,
        }))
      })
    } else if (typeof data.children === 'string') {
      const textNode: TextNode = {
        type: 'Text' as 'Text',
        volatileId: uuid(),
        parentVolatileId: volatileId,
        text: data.children,
        rendererId,
      }
      this._reduceNode(textNode.volatileId, () => textNode)
      this.events.emit('mount', textNode)
      volatileIdsOfChildren = [textNode.volatileId]
    } else {
      debugger
      throw new Error(`handle this case`)
    }

    if (data.nodeType === 'Wrapper') {
      const node: WrapperNode = {
        type: 'Wrapper',
        volatileId,
        reactSpecific: {
          internalData: data,
          internalInstance,
        },
        volatileIdsOfChildren,
        rendererId,
        parentVolatileId: PARENT_ID_UNKOWN,
      }
      this._reduceNode(volatileId, () => node)
      this.events.emit('mount', node)
    } else {
      const node: GenericNode = {
        type: 'Generic',
        volatileId,
        nativeNode: data.publicInstance,
        reactSpecific: {
          internalData: data,
          internalInstance,
        },
        volatileIdsOfChildren,
        rendererId,
        parentVolatileId: PARENT_ID_UNKOWN,
      }
      this._reduceNode(volatileId, () => node)
      this.events.emit('mount', node)
    }
  }

  getNodeByVolatileId(volatileId: string): Node | undefined {
    return this.state.nodesByVolatileId[volatileId]
  }

  getNativeElementByVolatileId(
    id: string,
  ): undefined | Element | React.Component<mixed, mixed> {
    const node = this.getNodeByVolatileId(id)
    if (!node || node.type !== 'Generic') return undefined
    return node.nativeNode
  }

  /**
   * Calls the callback for every node encountered from the top of the tree.
   * @param cb The callback. Return `false` if you don't want to break the walk.
   * @param volatileId In case you want to start from a specific node and discard its ancestors
   */
  walk(cb: (node: Node) => void | false, volatileId?: VolatileId) {
    const nodeIds = volatileId
      ? [volatileId]
      : Object.keys(this.state.renderers).reduce(
          (ids: string[], rendererId) => {
            const renderer = this.getState().renderers[rendererId]
            return ids.concat(renderer.volatileIdsOfRootNodes)
          },
          [],
        )

    this._walk(nodeIds, cb)
  }

  private _walk(nodeIds: VolatileId[], cb: (node: Node) => void | false) {
    const stack = new Stack<VolatileId[]>()
    stack.push([...nodeIds])
    while (true) {
      const top = stack.peek()
      if (!top) return
      if (top.length === 0) {
        stack.pop()
        continue
      }
      const id = top.shift() as VolatileId
      const node = this.getNodeByVolatileId(id)
      if (!node) {
        throw new Error(
          `Got a childVolatileId for a child that doesn't exist. This should never happen`,
        )
      }
      if (cb(node) === false) {
        return
      }
      if (node.type === 'Text') continue
      const volatileIdsOfchildrenA = node.volatileIdsOfChildren
      if (volatileIdsOfchildrenA) {
        const volatileIdsOfChildren = volatileIdsOfchildrenA
        if (volatileIdsOfChildren.length > 0) {
          stack.push(volatileIdsOfChildren)
        }
      }
    }
  }

  private _reactToTextNodeMount(
    volatileId: string,
    data: DataType,
    internalInstance: OpaqueNodeHandle,
    rendererId: string,
  ) {
    const node: TextNode = {
      type: 'Text' as 'Text',
      volatileId,
      reactSpecific: {internalData: data, internalInstance},
      text: data.text as string,
      rendererId,
      parentVolatileId: PARENT_ID_UNKOWN,
    }
    this._reduceNode(volatileId, () => node)
    this.events.emit('mount', node)
  }

  private _reactToRoot = ({
    internalInstance,
    renderer: rendererId,
  }: {
    internalInstance: OpaqueNodeHandle
    renderer: RendererId
  }) => {
    if (this._rendererInterestedIn && this._rendererInterestedIn !== rendererId)
      return
    const volatileId = this._volatileIdsByInternalInstances.get(
      internalInstance,
    )
    if (!volatileId) {
      throw new Error(
        `Got a 'root' event with an internalInstance that is does not have a volatileId. This should never happen`,
      )
    }
    const node = this.getNodeByVolatileId(volatileId) as Node
    if (node.type !== 'Wrapper') {
      throw new Error(`Got a root event but not for a wrapper.`)
    }
    if (node.parentVolatileId !== undefined) {
      throw new Error(
        `Got a root event for a node that already has a parentVolatileId`,
      )
    }

    this._reduceState(['renderers', rendererId, 'volatileIdsOfRootNodes'], v =>
      v.concat([volatileId]),
    )
    this._reduceNode(volatileId, n => ({
      ...n,
      parentVolatileId: PARENT_ID_ROOT,
    }))
    // if (
    //   this.getState().renderers[rendererId].volatileIdsOfRootNodes.indexOf(
    //     volatileId,
    //   ) === -1
    // ) {
    //   throw new Error(
    //     `Got a 'root' event whose volatileId is not in its renderer's volatileIdsOfRootNodes. This should never happen`,
    //   )
    // }
  }
}
