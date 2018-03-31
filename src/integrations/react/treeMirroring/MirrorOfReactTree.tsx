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
import dict, {DictAtom} from '$shared/DataVerse/atoms/dict'
import arrayAtom, {ArrayAtom} from '$shared/DataVerse/atoms/array'

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

const PARENT_ID_UNKOWN = '0'

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
export type GenericNode = DictAtom<
  StuffMostNodesHaveInCommon & {
    type: 'Generic'
    internalData: DataType
    internalInstance: OpaqueNodeHandle
    volatileIdsOfChildren: ArrayAtom<VolatileId>
  }
>

/**
 * WrapperNode is at the very top of every react tree
 */
type WrapperNode = DictAtom<{
  type: 'Wrapper'
  volatileId: VolatileId
  rendererId: RendererId
  internalData: DataType
  internalInstance: OpaqueNodeHandle
  volatileIdsOfChildren: ArrayAtom<VolatileId>
}>

type TextNode = DictAtom<
  StuffMostNodesHaveInCommon & {
    type: 'Text'
    textData:
      | string
      | {internalData: DataType; internalInstance: OpaqueNodeHandle}
  }
>

export type Node = GenericNode | TextNode | WrapperNode

export const isGenericNode = (n: Node): n is GenericNode => {
  return n.prop('type') === 'Generic'
}

export const isWrapperNode = (n: Node): n is WrapperNode => {
  // @ts-ignore @todo
  return n.prop('type') === 'Wrapper'
}

export const isTextNode = (n: Node): n is TextNode => {
  // @ts-ignore @todo
  return n.prop('type') === 'Text'
}

interface Renderer {
  rendererId: RendererId
  renderer: ReactRenderer
  helpers: Helpers
  volatileIdsOfRootNodes: VolatileId[]
}

export default class MirrorOfReactTree {
  // All the subscriptions to _hook.sub(). We'll call all of thsese on #cleanup()
  _subscriptions: AnyFn[]
  // reference to __REACT_DEVTOOLS_GLOBAL_HOOK__
  _hook: Hook
  _volatileIdsByInternalInstances: WeakMap<OpaqueNodeHandle, VolatileId>
  _atom: DictAtom<{
    renderers: DictAtom<{[rendererId: string]: Renderer}>
    nodesByVolatileId: DictAtom<{[volatileId: string]: Node}>
  }>

  constructor() {
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
      throw new Error(
        `__REACT_DEVTOOLS_GLOBAL_HOOK__ not found. This should never happen`,
      )

    this._hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    this._subscriptions = []
    this._atom = new DictAtom({
      renderers: new DictAtom({}),
      nodesByVolatileId: new DictAtom({}),
    })
    this._volatileIdsByInternalInstances = new WeakMap()

    this._setup()
  }

  _getRenderer(id: RendererId) {
    return this._atom.prop('renderers').prop(id)
  }

  _setRenderer(id: RendererId, r: Renderer) {
    this._atom.prop('renderers').setProp(id, r)
  }

  _setup() {
    this._subscriptions.push(
      this._hook.sub('root', this._reactToRoot),
      this._hook.sub('mount', this._reactToMount),
      this._hook.sub('unmount', this._reactToUnmount),
      this._hook.sub('update', this._reactToUpdate),
      this._hook.sub(
        'renderer-attached',
        ({id: rendererId, helpers, renderer}) =>
          this._reactToRendererAttached({rendererId, helpers, renderer}),
      ),
    )

    for (const rendererId in this._hook.helpers) {
      const renderer = this._hook._renderers[rendererId]
      const helpers = this._hook.helpers[rendererId]
      this._reactToRendererAttached({rendererId, renderer, helpers})
    }
  }

  _cleanup() {
    const subs = this._subscriptions
    this._subscriptions = []
    subs.forEach(fn => fn())
    this._atom.prop('renderers').clear()
    this._atom.prop('nodesByVolatileId').clear()
  }

  _getOrAssignVolatileIdFromInternalInstance(
    internalInstance: OpaqueNodeHandle,
  ): VolatileId {
    const possibleVolatileId = this._getVolatileIdFromInternalInstance(
      internalInstance,
    )

    if (!possibleVolatileId) {
      const volatileID = uuid()
      this._volatileIdsByInternalInstances.set(internalInstance, volatileID)
      return volatileID
    } else {
      return possibleVolatileId
    }
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
    const volatileId = this._getVolatileIdFromInternalInstance(internalInstance)

    if (!volatileId) {
      throw new Error(
        `Got an 'unmount' with internalInstance that doesn't have a volatileId`,
      )
    }
    const node = this._getNodeByVolatileId(volatileId) as Node

    if (isGenericNode(node) || isWrapperNode(node)) {
      if (node.prop('volatileIdsOfChildren').length() !== 0) {
        // debugger
        throw new Error(
          `Got an unmount for a node that still has volatileIdsOfChildren. This should never happen`,
        )
      }
    }

    if (isWrapperNode(node)) {
      const renderer = this._getRenderer(node.prop('rendererId'))
      renderer.volatileIdsOfRootNodes.splice(
        renderer.volatileIdsOfRootNodes.indexOf(volatileId),
        1,
      )
      this._atom.prop('nodesByVolatileId').deleteProp(volatileId)
      return
    }

    const parentVolatileId: VolatileId | undefined = node.prop('parentVolatileId')
    if (!parentVolatileId) {
      throw new Error(
        `Got an unmount for a node that doesn't have a parentVolatileId`,
      )
    }
    const parentNode = this._getNodeByVolatileId(parentVolatileId) as
      | WrapperNode
      | GenericNode
      | undefined

    if (!parentNode) {
      throw new Error(
        `Got an unmount for a node whose parent has been deregistered`,
      )
    }

    parentNode.prop('volatileIdsOfChildren').pluck(volatileId)

    this._atom.prop('nodesByVolatileId').deleteProp(volatileId)
  }

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
    if (rest.type !== 'update') {
      throw new Error(`type is ${rest.type}. Investigate`)
    }
    const {nodeType} = data
    if (nodeType === 'Native' || nodeType === 'Composite') {
      this._reactToGenericOrWrapperUpdate(internalInstance, data, rendererId)
    } else {
      debugger
    }
  }

  _reactToGenericOrWrapperUpdate = (
    internalInstance: OpaqueNodeHandle,
    data: DataType,
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

    const node = this._getNodeByVolatileId(volatileId) as GenericNode
    const oldNodeStuff = {
      volatileIdsOfChildren: node.prop('volatileIdsOfChildren').unbox(),
      internalData: node.prop('internalData'),
    }
    node.setProp('internalData', data)

    if (Array.isArray(data.children)) {
      if (typeof oldNodeStuff.internalData.children === 'string') {
        this._atom.prop('nodesByVolatileId').deleteProp(oldNodeStuff.volatileIdsOfChildren[0])
      }
      const volatileIdsOfChildren: VolatileId[] = data.children.map(
        childInternalInstance =>
          this._getOrAssignVolatileIdFromInternalInstance(
            childInternalInstance,
          ),
      )

      volatileIdsOfChildren.forEach((childVolatileId: VolatileId) => {
        // @ts-ignore @todo
        ;(this._getNodeByVolatileId(childVolatileId) as
          | TextNode
          | GenericNode).setProp('parentVolatileId', volatileId)
      })

      node.prop('volatileIdsOfChildren').replace(volatileIdsOfChildren)

    } else if (typeof data.children === 'string') {
      if (typeof oldNodeStuff.internalData.children === 'string') {
        const oldChildVolatileId = oldNodeStuff.volatileIdsOfChildren[0]
        const oldChildNode = this._getNodeByVolatileId(
          oldChildVolatileId,
        ) as TextNode
        oldChildNode.setProp('textData', data.children)
      } else {
        const newTextNode: TextNode = dict({
          type: 'Text' as 'Text',
          volatileId: uuid(),
          parentVolatileId: volatileId,
          textData: data.children,
          rendererId,
        })
        this._atom.prop('nodesByVolatileId').setProp(newTextNode.prop('volatileId'), newTextNode)
        node.prop('volatileIdsOfChildren').replace([newTextNode.prop('volatileId')])
        node.setProp('internalData', data)
      }
    } else {
      debugger
      throw new Error(`Handle this case`)
    }
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
        // @ts-ignore @todo
        ;(this._getNodeByVolatileId(childVolatileId) as
          | TextNode
          | GenericNode).setProp('parentVolatileId', volatileId)
      })
    } else if (typeof data.children === 'string') {
      const textNode: TextNode = dict({
        type: 'Text' as 'Text',
        volatileId: uuid(),
        parentVolatileId: volatileId,
        textData: data.children,
        rendererId,
      })
      this._atom
        .prop('nodesByVolatileId')
        .setProp(textNode.prop('volatileId'), textNode)
      volatileIdsOfChildren = [textNode.prop('volatileId')]
    } else {
      debugger
      throw new Error(`handle this case`)
    }

    if (data.nodeType === 'Wrapper') {
      this._atom
        .prop('renderers')
        .prop(rendererId)
        .volatileIdsOfRootNodes.push(volatileId)

      const node: WrapperNode = dict({
        type: 'Wrapper' as 'Wrapper',
        volatileId,
        internalData: data,
        internalInstance,
        volatileIdsOfChildren: arrayAtom(volatileIdsOfChildren),
        rendererId,
      })
      this._atom.prop('nodesByVolatileId').setProp(volatileId, node)
    } else {
      const node: GenericNode = dict({
        type: 'Generic' as 'Generic',
        volatileId,
        internalData: data,
        internalInstance,
        volatileIdsOfChildren: arrayAtom(volatileIdsOfChildren),
        rendererId,
        parentVolatileId: PARENT_ID_UNKOWN,
      })
      this._atom.prop('nodesByVolatileId').setProp(volatileId, node)
    }
  }

  _getNodeByVolatileId(childVolatileId: string): Node | undefined {
    return this._atom.prop('nodesByVolatileId').prop(childVolatileId)
  }

  private _reactToTextNodeMount(
    volatileId: string,
    data: DataType,
    internalInstance: OpaqueNodeHandle,
    rendererId: string,
  ) {
    const node: TextNode = dict({
      type: 'Text' as 'Text',
      volatileId,
      textData: {internalData: data, internalInstance},
      rendererId,
      parentVolatileId: PARENT_ID_UNKOWN,
    })
    this._atom.prop('nodesByVolatileId').setProp(volatileId, node)
  }

  private _reactToRoot = ({
    internalInstance,
    renderer: rendererId,
  }: {
    internalInstance: OpaqueNodeHandle
    renderer: RendererId
  }) => {
    const volatileId = this._volatileIdsByInternalInstances.get(
      internalInstance,
    )
    if (!volatileId) {
      throw new Error(
        `Got a 'root' event with an internalInstance that is does not have a volatileId. This should never happen`,
      )
    }
    if (
      this._atom
        .prop('renderers')
        .prop(rendererId)
        .volatileIdsOfRootNodes.indexOf(volatileId) === -1
    ) {
      throw new Error(
        `Got a 'root' event whose volatileId is not in its renderer's volatileIdsOfRootNodes. This should never happen`,
      )
    }
  }
}
