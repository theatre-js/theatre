/**
 * This is a typescript translation of https://github.com/facebook/react-devtools/blob/master/backend/types.js
 * We keep a mirror of that file in $root/vendor/react-devtools-backend/types.js
 * 
 * In order to keep this file up to date, make sure to first, keep the types.js file uptodate with the main
 * react-devtools repo. And reflect the resulting diff in this file (types.ts) too.
 */

import * as _React from 'react'
export type React = typeof _React

import * as _ReactDOM from 'react-dom'
export type ReactDOM = typeof _ReactDOM

// flow's void
type _void = undefined | null | void
// flow's Object
type _Object = $FixMe

type CompositeUpdater = {
  setInProps: _void | ((path: Array<string>, value: any) => _void)
  setInState: _void | ((path: Array<string>, value: any) => _void)
  setInContext: _void | ((path: Array<string>, value: any) => _void)
  forceUpdate: _void | (() => _void)
}

type NativeUpdater = {
  setNativeProps: _void | ((nativeProps: {[key: string]: any}) => _void)
}

export type DataType = {
  nodeType:
    | 'Native'
    | 'Wrapper'
    | 'NativeWrapper'
    | 'Composite'
    | 'Special'
    | 'Text'
    | 'Portal'
    | 'Empty'
  type: _void | (string | AnyFn)
  key: _void | string
  ref: _void | (string | AnyFn)
  source: _void | _Object
  name: _void | string
  props: _void | _Object
  state: _void | _Object
  context: _void | _Object
  children: _void | (string | Array<OpaqueNodeHandle>)
  text: _void | string
  updater: _void | (CompositeUpdater | NativeUpdater)
  publicInstance: _void | _Object
}

// This type is entirely opaque to the backend.
export type OpaqueNodeHandle = {
  _rootNodeID: string
}
export type NativeType = {}
export type RendererId = string

type DOMNode = {}

export type AnyFn = (...args: Array<$IntentionalAny>) => $IntentionalAny

type BundleType =
  // PROD
  | 0
  // DEV
  | 1

export type ReactRenderer = {
  // Fiber
  findHostInstanceByFiber: (fiber: _Object) => _void | NativeType
  findFiberByHostInstance: (
    hostInstance: NativeType,
  ) => _void | OpaqueNodeHandle
  version: string
  bundleType: BundleType

  // Stack
  Reconciler: {
    mountComponent: AnyFn
    performUpdateIfNecessary: AnyFn
    receiveComponent: AnyFn
    unmountComponent: AnyFn
  }
  Component?: {
    Mixin: _Object
  }
  Mount: {
    // React Native
    nativeTagToRootNodeID: (tag: _void | NativeType) => string
    findNodeHandle: (component: _Object) => _void | NativeType
    renderComponent: AnyFn
    _instancesByContainerID: _Object

    // React DOM
    getID: (node: DOMNode) => string
    getNode: (id: string) => _void | DOMNode
    _instancesByReactRootID: _Object
    _renderNewRootComponent: AnyFn
  }
  ComponentTree: {
    getNodeFromInstance: (component: OpaqueNodeHandle) => _void | NativeType
    getClosestInstanceFromNode: (
      component: NativeType,
    ) => _void | OpaqueNodeHandle
  }
}

export type Helpers = {
  getNativeFromReactElement?:
    | _void
    | ((component: OpaqueNodeHandle) => _void | NativeType)
  getReactElementFromNative?:
    | _void
    | ((component: NativeType) => _void | OpaqueNodeHandle)
  walkTree: (
    visit: (component: OpaqueNodeHandle, data: DataType) => _void,
    visitRoot: (element: OpaqueNodeHandle) => _void,
  ) => _void
  cleanup: () => _void
}

export type Handler = (data: any) => _void

export interface Hook {
  _renderers: {[key: string]: ReactRenderer}
  _listeners: {[key: string]: Array<Handler>}
  helpers: {[key: string]: Helpers}
  inject: (renderer: ReactRenderer) => string | null
  emit: (evt: string, data: any) => _void
  sub: (evt: string, handler: Handler) => () => _void
  on: (evt: string, handler: Handler) => _void
  off: (evt: string, handler: Handler) => _void
  reactDevtoolsAgent?: _void | _Object
  getFiberRoots: (rendererID: string) => Set<_Object>
}
