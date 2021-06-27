import type {IDerivation} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {findIndex} from 'lodash-es'
import queueMicrotask from 'queue-microtask'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react'
import {unstable_batchedUpdates} from 'react-dom'
import {useForceUpdate} from './react/hooks'
import type {$IntentionalAny, VoidFn} from './types'

export function usePrism<T>(
  fn: () => T,
  deps: unknown[],
  debugLabel?: string,
): T {
  const fnAsCallback = useCallback(fn, deps)
  const boxRef = useRef<Box<typeof fn>>(null as $IntentionalAny)
  if (!boxRef.current) {
    boxRef.current = new Box(fnAsCallback)
  } else {
    boxRef.current.set(fnAsCallback)
  }

  const derivation = useMemo(
    () =>
      prism(() => {
        const fn = boxRef.current.derivation.getValue()
        return fn()
      }),
    [],
  )

  return useDerivation(derivation, debugLabel)
}

export const useVal: typeof val = (p) => {
  return usePrism(() => val(p), [p])
}

/**
 * Each usePrism() call is assigned an `order`. Parents have a smaller
 * order than their children, and so on.
 */
let lastOrder = 0

/**
 * A sorted array of derivations that need to be refreshed. The derivations are sorted
 * by their order, which means a parent derivation always gets priority to children
 * and descendents. Ie. we refresh the derivations top to bottom.
 */
const queue: QueueItem[] = []
const setOfQueuedItems = new Set<QueueItem>()

type QueueItem = {
  order: number
  /**
   * runUpdate() is the equivalent of a forceUpdate() call.
   */
  runUpdate: VoidFn
  debugLabel?: string
}

let microtaskIsQueued = false

const pushToQueue = (item: QueueItem) => {
  _pushToQueue(item)
  if (!microtaskIsQueued) {
    microtaskIsQueued = true
    queueMicrotask(() => {
      while (queue.length > 0) {
        unstable_batchedUpdates(() => {
          for (const item of queue) {
            item.runUpdate()
          }
        })
      }
      microtaskIsQueued = false
    })
  }
}

const _pushToQueue = (item: QueueItem) => {
  if (setOfQueuedItems.has(item)) return
  setOfQueuedItems.add(item)

  if (queue.length === 0) {
    queue.push(item)
  } else {
    const index = findIndex(
      queue,
      (existingItem) => existingItem.order >= item.order,
    )
    if (index === -1) {
      queue.push(item)
    } else {
      const right = queue[index]
      if (right.order > item.order) {
        queue.splice(index, 0, item)
      }
    }
  }
}

const removeFromQueue = (item: QueueItem) => {
  if (!setOfQueuedItems.has(item)) return
  setOfQueuedItems.delete(item)

  const index = findIndex(queue, (o) => o === item)
  queue.splice(index, 1)
}

/**
 * @remarks
 * It looks like this new implementation of useDerivation() manages to:
 * 1. Not over-calculate the derivations
 * 2. Render derivation in ancestor -> descendent order
 * 3. Not set off React's concurrent mode alarms
 *
 * It works like an implementation of Dataverse's Ticker, except that it runs
 * the side effects in an order where a component's derivation is guaranteed
 * to run before any of its descendents' derivations.
 *
 * I'm happy with how little bookkeeping we ended up doing here.
 */
function useDerivation<T>(der: IDerivation<T>, debugLabel?: string): T {
  const _forceUpdate = useForceUpdate(debugLabel)

  const refs = useRef<{queueItem: QueueItem; unmounted: boolean}>(
    undefined as $IntentionalAny,
  )
  if (!refs.current) {
    lastOrder++
    refs.current = {
      queueItem: {
        debugLabel,
        order: lastOrder,
        runUpdate: () => {
          if (!refs.current.unmounted) {
            _forceUpdate()
          }
        },
      },
      unmounted: false,
    }
  }

  const queueUpdate = useCallback(() => {
    pushToQueue(refs.current.queueItem)
  }, [])

  useLayoutEffect(() => {
    const untap = der.changesWithoutValues().tap(() => {
      queueUpdate()
    })
    if (lastValueRef.current !== der.getValue()) {
      queueUpdate()
    }

    return untap
  }, [der])

  useLayoutEffect(() => {
    return function onUnmount() {
      refs.current.unmounted = true
      removeFromQueue(refs.current.queueItem)
    }
  }, [])

  const lastValueRef = useRef<T>(undefined as $IntentionalAny as T)
  const queueItem = refs.current.queueItem

  // we defer refreshing our derivation if:
  const mustDefer =
    // we are actually queued to refresh
    setOfQueuedItems.has(queueItem) &&
    // but it's not our turn yet
    queue[0] !== refs.current.queueItem

  if (!mustDefer) {
    removeFromQueue(queueItem)
    lastValueRef.current = der.getValue()
  } else {
    // if it's not our turn, we return the last cached value,
    // which react will actually drop, because the microtask
    // queue will make sure to forceUpdate() us before react
    // flushes to DOM.
  }

  return lastValueRef.current
}

/**
 * This makes sure the prism derivation remains hot as long as the
 * component calling the hook is alive, but it does not
 * return the value of the derivation, and it does not
 * re-render the component if the value of the derivation changes.
 *
 * Use this hook if you plan to read a derivation in a
 * useEffect() call, without the derivation causing your
 * element to re-render.
 */
export function usePrismWithoutReRender<T>(
  fn: () => T,
  deps: unknown[],
): IDerivation<T> {
  const derivation = useMemo(() => prism(fn), deps)

  return useDerivationWithoutReRender(derivation)
}

/**
 * This makes sure the derivation remains hot as long as the
 * component calling the hook is alive, but it does not
 * return the value of the derivation, and it does not
 * re-render the component if the value of the derivation changes.
 */
export function useDerivationWithoutReRender<T>(
  der: IDerivation<T>,
): IDerivation<T> {
  useEffect(() => {
    const untap = der.keepHot()

    return () => {
      untap()
    }
  }, [der])

  return der
}
