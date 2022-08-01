import type {VoidFn} from '@theatre/shared/utils/types'
import type React from 'react';
import {useEffect, useRef} from 'react'

/**
 * useEffectMutation was introduced as a helper to support with fixing memory allocation issues
 * where we'd do a DOM mutation on every single keyframe.
 *
 * Introduced for fixing https://linear.app/theatre/issue/P-268/fix-the-memory-leak
 *
 * This construct basically gives us the `ref={...}` functionality with the ability to
 * return a cleanup function for untapping from Derivations or removing event listeners.
 *
 * We use this by breaking out mutations into refs to reduce memory allocations by direct
 * assigning style properties or dataset values to the elements. See Playhead rendering.
 */
export function useElementMutation<T extends HTMLElement = HTMLElement>(
  callback: (element: T) => VoidFn,
): React.Ref<T> {
  const listenerRef = useRef(undefined as undefined | VoidFn)
  // effect to ensure that unmounting disposes of this listener's dependents
  useEffect(() => () => clearListener(listenerRef), [])
  return (elt) => {
    clearListener(listenerRef)
    if (elt) {
      listenerRef.current = callback(elt)
    }
  }
}
function clearListener(ref: React.MutableRefObject<undefined | VoidFn>) {
  if (ref.current) {
    ref.current?.()
    ref.current = undefined
  }
}
