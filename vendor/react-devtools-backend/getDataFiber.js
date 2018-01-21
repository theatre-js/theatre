/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

import type {DataType} from './types';
var copyWithSet = require('./copyWithSet');
var getDisplayName = require('./getDisplayName');
var {
  FunctionalComponent,
  ClassComponent,
  HostRoot,
  HostPortal,
  HostComponent,
  HostText,
  Fragment,
} = require('./ReactTypeOfWork');

// TODO: we might want to change the data structure
// once we no longer suppport Stack versions of `getData`.
function getDataFiber(fiber: Object, getOpaqueNode: (fiber: Object) => Object): DataType {
  var type = fiber.type;
  var key = fiber.key;
  var ref = fiber.ref;
  var source = fiber._debugSource;
  var publicInstance = null;
  var props = null;
  var state = null;
  var children = null;
  var context = null;
  var updater = null;
  var nodeType = null;
  var name = null;
  var text = null;

  switch (fiber.tag) {
    case FunctionalComponent:
    case ClassComponent:
      nodeType = 'Composite';
      name = getDisplayName(fiber.type);
      publicInstance = fiber.stateNode;
      props = fiber.memoizedProps;
      state = fiber.memoizedState;
      if (publicInstance != null) {
        context = publicInstance.context;
        if (context && Object.keys(context).length === 0) {
          context = null;
        }
      }
      const inst = publicInstance;
      if (inst) {
        updater = {
          setState: inst.setState && inst.setState.bind(inst),
          forceUpdate: inst.forceUpdate && inst.forceUpdate.bind(inst),
          setInProps: inst.forceUpdate && setInProps.bind(null, fiber),
          setInState: inst.forceUpdate && setInState.bind(null, inst),
          setInContext: inst.forceUpdate && setInContext.bind(null, inst),
        };
      }
      children = [];
      break;
    case HostRoot:
      nodeType = 'Wrapper';
      children = [];
      break;
    case HostPortal:
      nodeType = 'Portal';
      name = 'ReactPortal';
      props = {
        target: fiber.stateNode.containerInfo,
      };
      children = [];
      break;
    case HostComponent:
      nodeType = 'Native';
      name = fiber.type;

      // TODO (bvaughn) we plan to remove this prefix anyway.
      // We can cut this special case out when it's gone.
      name = name.replace('topsecret-', '');

      publicInstance = fiber.stateNode;
      props = fiber.memoizedProps;
      if (
        typeof props.children === 'string' ||
        typeof props.children === 'number'
      ) {
        children = props.children.toString();
      } else {
        children = [];
      }
      if (typeof fiber.stateNode.setNativeProps === 'function') {
        // For editing styles in RN
        updater = {
          setNativeProps(nativeProps) {
            fiber.stateNode.setNativeProps(nativeProps);
          },
        };
      }
      break;
    case HostText:
      nodeType = 'Text';
      text = fiber.memoizedProps;
      break;
    case Fragment:
      nodeType = 'Wrapper';
      children = [];
      break;
    default: // Coroutines and yields
      nodeType = 'Native';
      props = fiber.memoizedProps;
      name = 'TODO_NOT_IMPLEMENTED_YET';
      children = [];
      break;
  }

  if (Array.isArray(children)) {
    let child = fiber.child;
    while (child) {
      children.push(getOpaqueNode(child));
      child = child.sibling;
    }
  }

  return {
    nodeType,
    type,
    key,
    ref,
    source,
    name,
    props,
    state,
    context,
    children,
    text,
    updater,
    publicInstance,
  };
}

function setInProps(fiber, path: Array<string | number>, value: any) {
  const inst = fiber.stateNode;
  fiber.pendingProps = copyWithSet(inst.props, path, value);
  if (fiber.alternate) {
    // We don't know which fiber is the current one because DevTools may bail out of getDataFiber() call,
    // and so the data object may refer to another version of the fiber. Therefore we update pendingProps
    // on both. I hope that this is safe.
    fiber.alternate.pendingProps = fiber.pendingProps;
  }
  fiber.stateNode.forceUpdate();
}

function setInState(inst, path: Array<string | number>, value: any) {
  setIn(inst.state, path, value);
  inst.forceUpdate();
}

function setInContext(inst, path: Array<string | number>, value: any) {
  setIn(inst.context, path, value);
  inst.forceUpdate();
}

function setIn(obj: Object, path: Array<string | number>, value: any) {
  var last = path.pop();
  var parent = path.reduce((obj_, attr) => obj_ ? obj_[attr] : null, obj);
  if (parent) {
    parent[last] = value;
  }
}

module.exports = getDataFiber;
