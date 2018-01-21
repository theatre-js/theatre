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

function getData012(internalInstance: Object): DataType {
  var children = null;
  var props = internalInstance.props;
  var state = internalInstance.state;
  var context = internalInstance.context;
  var updater = null;
  var name = null;
  var type = null;
  var key = null;
  var ref = null;
  var text = null;
  var publicInstance = null;
  var nodeType = 'Native';
  if (internalInstance._renderedComponent) {
    nodeType = 'Wrapper';
    children = [internalInstance._renderedComponent];
    if (context && Object.keys(context).length === 0) {
      context = null;
    }
  } else if (internalInstance._renderedChildren) {
    name = internalInstance.constructor.displayName;
    children = childrenList(internalInstance._renderedChildren);
  } else if (typeof props.children === 'string') {
    // string children
    name = internalInstance.constructor.displayName;
    children = props.children;
    nodeType = 'Native';
  }

  if (!props && internalInstance._currentElement && internalInstance._currentElement.props) {
    props = internalInstance._currentElement.props;
  }

  if (internalInstance._currentElement) {
    type = internalInstance._currentElement.type;
    if (internalInstance._currentElement.key) {
      key = String(internalInstance._currentElement.key);
    }
    ref = internalInstance._currentElement.ref;
    if (typeof type === 'string') {
      name = type;
    } else {
      nodeType = 'Composite';
      name = type.displayName;
      if (!name) {
        name = 'No display name';
      }
    }
  }

  if (!name) {
    name = internalInstance.constructor.displayName || 'No display name';
    nodeType = 'Composite';
  }

  if (typeof props === 'string') {
    nodeType = 'Text';
    text = props;
    props = null;
    name = null;
  }

  if (internalInstance.forceUpdate) {
    updater = {
      setState: internalInstance.setState.bind(internalInstance),
      forceUpdate: internalInstance.forceUpdate.bind(internalInstance),
      setInProps: internalInstance.forceUpdate && setInProps.bind(null, internalInstance),
      setInState: internalInstance.forceUpdate && setInState.bind(null, internalInstance),
      setInContext: internalInstance.forceUpdate && setInContext.bind(null, internalInstance),
    };
    publicInstance = internalInstance;
  }

  return {
    nodeType,
    type,
    key,
    ref,
    source: null,
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

function setInProps(inst, path: Array<string | number>, value: any) {
  inst.props = copyWithSet(inst.props, path, value);
  inst.forceUpdate();
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

function childrenList(children) {
  var res = [];
  for (var name in children) {
    res.push(children[name]);
  }
  return res;
}

module.exports = getData012;
