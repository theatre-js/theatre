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

import type {Hook, ReactRenderer, Helpers} from './types';
var getDataFiber = require('./getDataFiber');
var {
  ClassComponent,
  HostRoot,
} = require('./ReactTypeOfWork');

// Inlined from ReactTypeOfSideEffect
var PerformedWork = 1;

function attachRendererFiber(hook: Hook, rid: string, renderer: ReactRenderer): Helpers {
  // This is a slightly annoying indirection.
  // It is currently necessary because DevTools wants
  // to use unique objects as keys for instances.
  // However fibers have two versions.
  // We use this set to remember first encountered fiber for
  // each conceptual instance.
  const opaqueNodes = new Set();
  function getOpaqueNode(fiber) {
    if (opaqueNodes.has(fiber)) {
      return fiber;
    }
    const {alternate} = fiber;
    if (alternate != null && opaqueNodes.has(alternate)) {
      return alternate;
    }
    opaqueNodes.add(fiber);
    return fiber;
  }

  function hasDataChanged(prevFiber, nextFiber) {
    if (prevFiber.tag === ClassComponent) {
      // Skip if the class performed no work (shouldComponentUpdate bailout).
      // eslint-disable-next-line no-bitwise
      if ((nextFiber.effectTag & PerformedWork) !== PerformedWork) {
        return false;
      }

      // Only classes have context.
      if (prevFiber.stateNode.context !== nextFiber.stateNode.context) {
        return true;
      }
      // Force updating won't update state or props.
      if (nextFiber.updateQueue != null && nextFiber.updateQueue.hasForceUpdate) {
        return true;
      }
    }
    // Compare the fields that would result in observable changes in DevTools.
    // We don't compare type, tag, index, and key, because these are known to match.
    return (
      prevFiber.memoizedProps !== nextFiber.memoizedProps ||
      prevFiber.memoizedState !== nextFiber.memoizedState ||
      prevFiber.ref !== nextFiber.ref ||
      prevFiber._debugSource !== nextFiber._debugSource
    );
  }

  let pendingEvents = [];

  function flushPendingEvents() {
    const events = pendingEvents;
    pendingEvents = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      hook.emit(event.type, event);
    }
  }

  function enqueueMount(fiber) {
    pendingEvents.push({
      internalInstance: getOpaqueNode(fiber),
      data: getDataFiber(fiber, getOpaqueNode),
      renderer: rid,
      type: 'mount',
    });

    const isRoot = fiber.tag === HostRoot;
    if (isRoot) {
      pendingEvents.push({
        internalInstance: getOpaqueNode(fiber),
        renderer: rid,
        type: 'root',
      });
    }
  }

  function enqueueUpdateIfNecessary(fiber, hasChildOrderChanged) {
    if (!hasChildOrderChanged && !hasDataChanged(fiber.alternate, fiber)) {
      return;
    }
    pendingEvents.push({
      internalInstance: getOpaqueNode(fiber),
      data: getDataFiber(fiber, getOpaqueNode),
      renderer: rid,
      type: 'update',
    });
  }

  function enqueueUnmount(fiber) {
    const isRoot = fiber.tag === HostRoot;
    const opaqueNode = getOpaqueNode(fiber);
    const event = {
      internalInstance: opaqueNode,
      renderer: rid,
      type: 'unmount',
    };
    if (isRoot) {
      pendingEvents.push(event);
    } else {
      // Non-root fibers are deleted during the commit phase.
      // They are deleted in the child-first order. However
      // DevTools currently expects deletions to be parent-first.
      // This is why we unshift deletions rather than push them.
      pendingEvents.unshift(event);
    }
    opaqueNodes.delete(opaqueNode);
  }

  function mountFiber(fiber) {
    // Depth-first.
    // Logs mounting of children first, parents later.
    let node = fiber;
    outer: while (true) {
      if (node.child) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      enqueueMount(node);
      if (node == fiber) {
        return;
      }
      if (node.sibling) {
        node.sibling.return = node.return;
        node = node.sibling;
        continue;
      }
      while (node.return) {
        node = node.return;
        enqueueMount(node);
        if (node == fiber) {
          return;
        }
        if (node.sibling) {
          node.sibling.return = node.return;
          node = node.sibling;
          continue outer;
        }
      }
      return;
    }
  }

  function updateFiber(nextFiber, prevFiber) {
    let hasChildOrderChanged = false;
    if (nextFiber.child !== prevFiber.child) {
      // If the first child is different, we need to traverse them.
      // Each next child will be either a new child (mount) or an alternate (update).
      let nextChild = nextFiber.child;
      let prevChildAtSameIndex = prevFiber.child;
      while (nextChild) {
        // We already know children will be referentially different because
        // they are either new mounts or alternates of previous children.
        // Schedule updates and mounts depending on whether alternates exist.
        // We don't track deletions here because they are reported separately.
        if (nextChild.alternate) {
          const prevChild = nextChild.alternate;
          updateFiber(nextChild, prevChild);
          // However we also keep track if the order of the children matches
          // the previous order. They are always different referentially, but
          // if the instances line up conceptually we'll want to know that.
          if (!hasChildOrderChanged && prevChild !== prevChildAtSameIndex) {
            hasChildOrderChanged = true;
          }
        } else {
          mountFiber(nextChild);
          if (!hasChildOrderChanged) {
            hasChildOrderChanged = true;
          }
        }
        // Try the next child.
        nextChild = nextChild.sibling;
        // Advance the pointer in the previous list so that we can
        // keep comparing if they line up.
        if (!hasChildOrderChanged && prevChildAtSameIndex != null) {
          prevChildAtSameIndex = prevChildAtSameIndex.sibling;
        }
      }
      // If we have no more children, but used to, they don't line up.
      if (!hasChildOrderChanged && prevChildAtSameIndex != null) {
        hasChildOrderChanged = true;
      }
    }
    enqueueUpdateIfNecessary(nextFiber, hasChildOrderChanged);
  }

  function walkTree() {
    hook.getFiberRoots(rid).forEach(root => {
      // Hydrate all the roots for the first time.
      mountFiber(root.current);
    });
    flushPendingEvents();
  }

  function cleanup() {
    // We don't patch any methods so there is no cleanup.
  }

  function handleCommitFiberUnmount(fiber) {
    // This is not recursive.
    // We can't traverse fibers after unmounting so instead
    // we rely on React telling us about each unmount.
    // It will be flushed after the root is committed.
    enqueueUnmount(fiber);
  }

  function handleCommitFiberRoot(root) {
    const current = root.current;
    const alternate = current.alternate;
    if (alternate) {
      // TODO: relying on this seems a bit fishy.
      const wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null;
      const isMounted = current.memoizedState != null && current.memoizedState.element != null;
      if (!wasMounted && isMounted) {
        // Mount a new root.
        mountFiber(current);
      } else if (wasMounted && isMounted) {
        // Update an existing root.
        updateFiber(current, alternate);
      } else if (wasMounted && !isMounted) {
        // Unmount an existing root.
        enqueueUnmount(current);
      }
    } else {
      // Mount a new root.
      mountFiber(current);
    }
    // We're done here.
    flushPendingEvents();
  }

  // The naming is confusing.
  // They deal with opaque nodes (fibers), not elements.
  function getNativeFromReactElement(fiber) {
    try {
      const opaqueNode = fiber;
      const hostInstance = renderer.findHostInstanceByFiber(opaqueNode);
      return hostInstance;
    } catch (err) {
      // The fiber might have unmounted by now.
      return null;
    }
  }
  function getReactElementFromNative(hostInstance) {
    const fiber = renderer.findFiberByHostInstance(hostInstance);
    if (fiber != null) {
      // TODO: type fibers.
      const opaqueNode = getOpaqueNode((fiber: any));
      return opaqueNode;
    }
    return null;
  }
  return {
    getNativeFromReactElement,
    getReactElementFromNative,
    handleCommitFiberRoot,
    handleCommitFiberUnmount,
    cleanup,
    walkTree,
  };
}

module.exports = attachRendererFiber;
