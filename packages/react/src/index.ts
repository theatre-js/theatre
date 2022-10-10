/**
 * React bindings for dataverse.
 *
 * @packageDocumentation
 */

import type {IDerivation} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {findIndex} from 'lodash-es'
import queueMicrotask from 'queue-microtask'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {unstable_batchedUpdates} from 'react-dom'

type $IntentionalAny = any
type VoidFn = () => void

/**
 * Enables a few traces and debug points to help identify performance glitches in `@theatre/react`.
 * Look up references to this value to see how to make use of those traces.
 */
const TRACE: boolean = false && process.env.NODE_ENV !== 'production'

function useForceUpdate(debugLabel?: string) {
  const [, setTick] = useState(0)

  const update = useCallback(() => {
    setTick((tick) => tick + 1)
  }, [])

  return update
}

/**
 * A React hook that executes the callback function and returns its return value
 * whenever there's a change in the values of the dependency array, or in the
 * derivations that are used within the callback function.
 *
 * @param fn - The callback function
 * @param deps - The dependency array
 * @param debugLabel - The label used by the debugger
 *
 * @remarks
 *
 * A common mistake with `usePrism()` is not including its deps in its dependency array. Let's
 * have an eslint rule to catch that.
 */
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

export const useVal: typeof val = (p: $IntentionalAny, debugLabel?: string) => {
  return usePrism(() => val(p), [p], debugLabel)
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

type QueueItem<T = unknown> = {
  order: number
  /**
   * runUpdate() is the equivalent of a forceUpdate() call. It would only be called
   * if the value of the inner derivation has _actually_ changed.
   */
  runUpdate: VoidFn
  /**
   * Some debugging info that are only present if {@link TRACE} is true
   */
  debug?: {
    /**
     * The `debugLabel` given to `usePrism()/useDerivation()`
     */
    label?: string
    /**
     * A trace of the first time the component got rendered
     */
    traceOfFirstTimeRender: Error
    /**
     * An array of the operations done on/about this useDerivation. This is helpful to trace
     * why a useDerivation's update was added to the queue and why it re-rendered
     */
    history: Array<
      /**
       * Item reached its turn in the queue
       */
      | `queue reached`
      /**
       * Item reached its turn in the queue, and errored (likely something in `prism()` threw an error)
       */
      | `queue: der.getValue() errored`
      /**
       * The item was added to the queue (may be called multiple times, but will only queue once)
       */
      | `queueUpdate()`
      /**
       * `cb` in `item.der.changesWithoutValues(cb)` was called
       */
      | `changesWithoutValues(cb)`
      /**
       * Item was rendered
       */
      | `rendered`
    >
  }
  /**
   * A reference to the derivation
   */
  der: IDerivation<T>
  /**
   * The last value of this derivation.
   */
  lastValue: T
  /**
   * Would be set to true if the element hosting the `useDerivation()` was unmounted
   */
  unmounted: boolean
  /**
   * Adds the `useDerivation` to the update queue
   */
  queueUpdate: () => void
  /**
   * Untaps from `this.der.changesWithoutValues()`
   */
  untap: () => void
}

let microtaskIsQueued = false

const pushToQueue = (item: QueueItem) => {
  _pushToQueue(item)
  queueIfNeeded()
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

/**
 * Plucks items from the queue
 */
const removeFromQueue = (item: QueueItem) => {
  if (!setOfQueuedItems.has(item)) return
  setOfQueuedItems.delete(item)

  const index = findIndex(queue, (o) => o === item)
  queue.splice(index, 1)
}

function queueIfNeeded() {
  if (microtaskIsQueued) return
  microtaskIsQueued = true

  queueMicrotask(() => {
    unstable_batchedUpdates(function runQueue() {
      while (queue.length > 0) {
        const item = queue.shift()!
        setOfQueuedItems.delete(item)

        let newValue
        if (TRACE) {
          item.debug?.history.push(`queue reached`)
        }
        try {
          newValue = item.der.getValue()
        } catch (error) {
          if (TRACE) {
            item.debug?.history.push(`queue: der.getValue() errored`)
          }
          console.error(
            'A `der.getValue()` in `useDerivation(der)` threw an error. ' +
              "This may be a zombie child issue, so we're gonna try to get its value again in a normal react render phase." +
              'If you see the same error again, then you either have an error in your prism code, or the deps array in `usePrism(fn, deps)` is missing ' +
              'a dependency and causing the prism to read stale values.',
          )
          console.error(error)

          item.runUpdate()

          continue
        }
        if (newValue !== item.lastValue) {
          item.lastValue = newValue
          item.runUpdate()
        }
      }
    }, 1)

    microtaskIsQueued = false
  })
}
/**
 * A React hook that returns the value of the derivation that it received as the first argument.
 * It works like an implementation of Dataverse's Ticker, except that it runs the side effects in
 * an order where a component's derivation is guaranteed to run before any of its descendents' derivations.
 *
 * @param der - The derivation
 * @param debugLabel - The label used by the debugger
 *
 * @remarks
 * It looks like this new implementation of useDerivation() manages to:
 * 1. Not over-calculate the derivations
 * 2. Render derivation in ancestor -\> descendent order
 * 3. Not set off React's concurrent mode alarms
 *
 *
 * I'm happy with how little bookkeeping we ended up doing here.
 *
 * ---
 *
 * Notes on the latest implementation:
 *
 * # Remove cold derivation reads
 *
 * Prior to the latest change, the first render of every `useDerivation()` resulted in a cold read of its inner derivation.
 * Cold reads are predictably slow. The reason we'd run cold reads was to comply with react's rule of not running side-effects
 * during render. (Turning a derivation hot is _technically_ a side-effect).
 *
 * However, now that users are animating scenes with hundreds of objects in the same sequence, the lag started to be noticable.
 *
 * This commit changes `useDerivation()` so that it turns its derivation hot before rendering them.
 *
 * # Freshen derivations before render
 *
 * Previously in order to avoid the zombie child problem (https://kaihao.dev/posts/stale-props-and-zombie-children-in-redux)
 * we deferred freshening the derivations to the render phase of components. This meant that if a derivation's dependencies
 * changed, `useDerivation()` would schedule a re-render, regardless of whether that change actually affected the derivation's
 * value. Here is a contrived example:
 *
 * ```ts
 * const num = new Box(1)
 * const isPositiveD = prism(() => num.derivation.getValue() >= 0)
 *
 * const Comp = () => {
 *   return <div>{useDerivation(isPositiveD)}</div>
 * }
 *
 * num.set(2) // would cause Comp to re-render- even though 1 is still a positive number
 * ```
 *
 * We now avoid this problem by freshening the derivation (i.e. calling `der.getValue()`) inside `runQueue()`,
 * and then only causing a re-render if the derivation's value is actually changed.
 *
 * This still avoids the zombie-child problem because `runQueue` reads the derivations in-order of their position in
 * the mounting tree.
 *
 * On the off-chance that one of them still turns out to be a zombile child, `runQueue` will defer that particular
 * `useDerivation()` to be read inside a normal react render phase.
 */
export function useDerivation<T>(der: IDerivation<T>, debugLabel?: string): T {
  const _forceUpdate = useForceUpdate(debugLabel)

  const ref = useRef<QueueItem<T>>(undefined as $IntentionalAny)

  if (!ref.current) {
    lastOrder++

    ref.current = {
      order: lastOrder,
      runUpdate: () => {
        if (!ref.current.unmounted) {
          _forceUpdate()
        }
      },
      der,
      lastValue: undefined as $IntentionalAny,
      unmounted: false,
      queueUpdate: () => {
        if (TRACE) {
          ref.current.debug?.history.push(`queueUpdate()`)
        }
        pushToQueue(ref.current)
      },
      untap: der.changesWithoutValues().tap(() => {
        if (TRACE) {
          ref.current.debug!.history.push(`changesWithoutValues(cb)`)
        }
        ref.current!.queueUpdate()
      }),
    }

    if (TRACE) {
      ref.current.debug = {
        label: debugLabel,
        traceOfFirstTimeRender: new Error(),
        history: [],
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (der !== ref.current.der) {
      console.error(
        'Argument `der` in `useDerivation(der)` should not change between renders.',
      )
    }
  }

  useLayoutEffect(() => {
    return function onUnmount() {
      ref.current.unmounted = true
      ref.current.untap()
      removeFromQueue(ref.current)
    }
  }, [])

  // if we're queued but are rendering before our turn, remove us from the queue
  removeFromQueue(ref.current)

  const newValue = ref.current.der.getValue()
  ref.current.lastValue = newValue

  if (TRACE) {
    ref.current.debug?.history.push(`rendered`)
  }

  return newValue
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
