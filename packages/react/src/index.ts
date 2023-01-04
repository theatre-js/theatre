/**
 * React bindings for dataverse.
 *
 * @packageDocumentation
 */

import type { Prism} from '@theatre/dataverse';
import {Atom} from '@theatre/dataverse'
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
 * prisms that are used within the callback function.
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
  const atomRef = useRef<Atom<typeof fn>>(null as $IntentionalAny)
  if (!atomRef.current) {
    atomRef.current = new Atom(fnAsCallback)
  } else {
    atomRef.current.setState(fnAsCallback)
  }

  const prsm = useMemo(
    () =>
      prism(() => {
        const fn = atomRef.current.prism.getValue()
        return fn()
      }),
    [],
  )

  return usePrismInstance(prsm, debugLabel)
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
 * A sorted array of prisms that need to be refreshed. The prisms are sorted
 * by their order, which means a parent prism always gets priority to children
 * and descendents. Ie. we refresh the prisms top to bottom.
 */
const queue: QueueItem[] = []
const setOfQueuedItems = new Set<QueueItem>()

type QueueItem<T = unknown> = {
  order: number
  /**
   * runUpdate() is the equivalent of a forceUpdate() call. It would only be called
   * if the value of the inner prism has _actually_ changed.
   */
  runUpdate: VoidFn
  /**
   * Some debugging info that are only present if {@link TRACE} is true
   */
  debug?: {
    /**
     * The `debugLabel` given to `usePrism()/usePrismInstance()`
     */
    label?: string
    /**
     * A trace of the first time the component got rendered
     */
    traceOfFirstTimeRender: Error
    /**
     * An array of the operations done on/about this usePrismInstance. This is helpful to trace
     * why a usePrismInstance's update was added to the queue and why it re-rendered
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
       * `cb` in `item.der.onStale(cb)` was called
       */
      | `onStale(cb)`
      /**
       * Item was rendered
       */
      | `rendered`
    >
  }
  /**
   * A reference to the prism
   */
  der: Prism<T>
  /**
   * The last value of this prism.
   */
  lastValue: T
  /**
   * Would be set to true if the element hosting the `usePrismInstance()` was unmounted
   */
  unmounted: boolean
  /**
   * Adds the `usePrismInstance` to the update queue
   */
  queueUpdate: () => void
  /**
   * Untaps from `this.der.unStale()`
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
            'A `der.getValue()` in `usePrismInstance(der)` threw an error. ' +
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
 * A React hook that returns the value of the prism that it received as the first argument.
 * It works like an implementation of Dataverse's Ticker, except that it runs the side effects in
 * an order where a component's prism is guaranteed to run before any of its descendents' prisms.
 *
 * @param der - The prism
 * @param debugLabel - The label used by the debugger
 *
 * @remarks
 * It looks like this new implementation of usePrism() manages to:
 * 1. Not over-calculate the prisms
 * 2. Render prism in ancestor -\> descendent order
 * 3. Not set off React's concurrent mode alarms
 *
 *
 * I'm happy with how little bookkeeping we ended up doing here.
 *
 * ---
 *
 * Notes on the latest implementation:
 *
 * # Remove cold prism reads
 *
 * Prior to the latest change, the first render of every `usePrismInstance()` resulted in a cold read of its inner prism.
 * Cold reads are predictably slow. The reason we'd run cold reads was to comply with react's rule of not running side-effects
 * during render. (Turning a prism hot is _technically_ a side-effect).
 *
 * However, now that users are animating scenes with hundreds of objects in the same sequence, the lag started to be noticable.
 *
 * This commit changes `usePrismInstance()` so that it turns its prism hot before rendering them.
 *
 * # Freshen prisms before render
 *
 * Previously in order to avoid the zombie child problem (https://kaihao.dev/posts/stale-props-and-zombie-children-in-redux)
 * we deferred freshening the prisms to the render phase of components. This meant that if a prism's dependencies
 * changed, `usePrismInstance()` would schedule a re-render, regardless of whether that change actually affected the prism's
 * value. Here is a contrived example:
 *
 * ```ts
 * const num = new Box(1)
 * const isPositiveD = prism(() => num.prism.getValue() >= 0)
 *
 * const Comp = () => {
 *   return <div>{usePrismInstance(isPositiveD)}</div>
 * }
 *
 * num.set(2) // would cause Comp to re-render- even though 1 is still a positive number
 * ```
 *
 * We now avoid this problem by freshening the prism (i.e. calling `der.getValue()`) inside `runQueue()`,
 * and then only causing a re-render if the prism's value is actually changed.
 *
 * This still avoids the zombie-child problem because `runQueue` reads the prisms in-order of their position in
 * the mounting tree.
 *
 * On the off-chance that one of them still turns out to be a zombile child, `runQueue` will defer that particular
 * `usePrismInstance()` to be read inside a normal react render phase.
 */
export function usePrismInstance<T>(der: Prism<T>, debugLabel?: string): T {
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
      untap: der.onStale(() => {
        if (TRACE) {
          ref.current.debug!.history.push(`onStale(cb)`)
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
        'Argument `der` in `usePrismInstance(der)` should not change between renders.',
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
 * This makes sure the prism prism remains hot as long as the
 * component calling the hook is alive, but it does not
 * return the value of the prism, and it does not
 * re-render the component if the value of the prism changes.
 *
 * Use this hook if you plan to read a prism in a
 * useEffect() call, without the prism causing your
 * element to re-render.
 */
export function usePrismWithoutReRender<T>(
  fn: () => T,
  deps: unknown[],
): Prism<T> {
  const pr = useMemo(() => prism(fn), deps)

  return usePrismInstanceWithoutReRender(pr)
}

/**
 * This makes sure the prism remains hot as long as the
 * component calling the hook is alive, but it does not
 * return the value of the prism, and it does not
 * re-render the component if the value of the prism changes.
 */
export function usePrismInstanceWithoutReRender<T>(der: Prism<T>): Prism<T> {
  useEffect(() => {
    const untap = der.keepHot()

    return () => {
      untap()
    }
  }, [der])

  return der
}
