import Box from '../../Box'
import type {$IntentionalAny, VoidFn} from '../../types'
import Stack from '../../utils/Stack'
import AbstractDerivation from '../AbstractDerivation'
import type {IDerivation} from '../IDerivation'
import {
  startIgnoringDependencies,
  stopIgnoringDependencies,
  pushCollector,
  popCollector,
} from './discoveryMechanism'

const voidFn = () => {}

export class PrismDerivation<V> extends AbstractDerivation<V> {
  protected _cacheOfDendencyValues: Map<IDerivation<unknown>, unknown> =
    new Map()
  protected _possiblyStaleDeps = new Set<IDerivation<unknown>>()
  private _prismScope = new PrismScope()

  constructor(readonly _fn: () => V) {
    super()
  }

  _recalculate() {
    let value: V

    if (this._possiblyStaleDeps.size > 0) {
      let anActuallyStaleDepWasFound = false
      startIgnoringDependencies()
      for (const dep of this._possiblyStaleDeps) {
        if (this._cacheOfDendencyValues.get(dep) !== dep.getValue()) {
          anActuallyStaleDepWasFound = true
          break
        }
      }
      stopIgnoringDependencies()
      this._possiblyStaleDeps.clear()
      if (!anActuallyStaleDepWasFound) {
        // console.log('ok')

        return this._lastValue!
      }
    }

    const newDeps: Set<IDerivation<unknown>> = new Set()
    this._cacheOfDendencyValues.clear()

    const collector = (observedDep: IDerivation<unknown>): void => {
      newDeps.add(observedDep)
      this._addDependency(observedDep)
    }

    pushCollector(collector)

    hookScopeStack.push(this._prismScope)
    try {
      value = this._fn()
    } catch (error) {
      console.error(error)
    } finally {
      const topOfTheStack = hookScopeStack.pop()
      if (topOfTheStack !== this._prismScope) {
        console.warn(
          // @todo guide the user to report the bug in an issue
          `The Prism hook stack has slipped. This is a bug.`,
        )
      }
    }

    popCollector(collector)

    for (const dep of this._dependencies) {
      if (!newDeps.has(dep)) {
        this._removeDependency(dep)
      }
    }

    this._dependencies = newDeps

    startIgnoringDependencies()
    for (const dep of newDeps) {
      this._cacheOfDendencyValues.set(dep, dep.getValue())
    }
    stopIgnoringDependencies()

    return value!
  }

  _reactToDependencyBecomingStale(msgComingFrom: IDerivation<unknown>) {
    this._possiblyStaleDeps.add(msgComingFrom)
  }

  _keepHot() {
    this._prismScope = new PrismScope()
    startIgnoringDependencies()
    this.getValue()
    stopIgnoringDependencies()
  }

  _becomeCold() {
    cleanupScopeStack(this._prismScope)
    this._prismScope = new PrismScope()
  }
}

class PrismScope {
  isPrismScope = true

  // NOTE probably not a great idea to eager-allocate all of these objects/maps for every scope,
  // especially because most wouldn't get used in the majority of cases. However, back when these
  // were stored on weakmaps, they were uncomfortable to inspect in the debugger.
  readonly subs: Record<string, PrismScope> = {}
  readonly effects: Map<string, IEffect> = new Map()
  readonly memos: Map<string, IMemo> = new Map()
  readonly refs: Map<string, IRef<unknown>> = new Map()

  sub(key: string) {
    if (!this.subs[key]) {
      this.subs[key] = new PrismScope()
    }
    return this.subs[key]
  }

  cleanupEffects() {
    for (const effect of this.effects.values()) {
      safelyRun(effect.cleanup, undefined)
    }
    this.effects.clear()
  }
}

function cleanupScopeStack(scope: PrismScope) {
  for (const sub of Object.values(scope.subs)) {
    cleanupScopeStack(sub)
  }
  scope.cleanupEffects()
}

function safelyRun<T, U>(
  fn: () => T,
  returnValueInCaseOfError: U,
): {ok: true; value: T} | {ok: false; value: U} {
  try {
    return {value: fn(), ok: true}
  } catch (error) {
    // Naming this function can allow the error reporter additional context to the user on where this error came from
    setTimeout(function PrismReportThrow() {
      // ensure that the error gets reported, but does not crash the current execution scope
      throw error
    })
    return {value: returnValueInCaseOfError, ok: false}
  }
}

const hookScopeStack = new Stack<PrismScope>()

type IRef<T> = {
  current: T
}

type IEffect = {
  deps: undefined | unknown[]
  cleanup: VoidFn
}

type IMemo = {
  deps: undefined | unknown[] | ReadonlyArray<unknown>
  cachedValue: unknown
}

function ref<T>(key: string, initialValue: T): IRef<T> {
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`prism.ref() is called outside of a prism() call.`)
  }

  let ref = scope.refs.get(key)
  if (ref !== undefined) {
    return ref as $IntentionalAny as IRef<T>
  } else {
    const ref = {
      current: initialValue,
    }
    scope.refs.set(key, ref)
    return ref
  }
}

/**
 * An effect hook, similar to React's `useEffect()`, but is not sensitive to call order by using `key`.
 *
 * @param key - the key for the effect. Should be uniqe inside of the prism.
 * @param cb - the callback function. Requires returning a cleanup function.
 * @param deps - the dependency array
 */
function effect(key: string, cb: () => () => void, deps?: unknown[]): void {
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`prism.effect() is called outside of a prism() call.`)
  }

  let effect = scope.effects.get(key)
  if (effect === undefined) {
    effect = {
      cleanup: voidFn,
      deps: undefined,
    }
    scope.effects.set(key, effect)
  }

  if (depsHaveChanged(effect.deps, deps)) {
    effect.cleanup()

    startIgnoringDependencies()
    effect.cleanup = safelyRun(cb, voidFn).value
    stopIgnoringDependencies()
    effect.deps = deps
  }
}

function depsHaveChanged(
  oldDeps: undefined | unknown[] | ReadonlyArray<unknown>,
  newDeps: undefined | unknown[] | ReadonlyArray<unknown>,
): boolean {
  if (oldDeps === undefined || newDeps === undefined) {
    return true
  }

  const len = oldDeps.length
  if (len !== newDeps.length) return true

  for (let i = 0; i < len; i++) {
    if (oldDeps[i] !== newDeps[i]) return true
  }

  return false
}

/**
 * Store a value to this {@link prism} stack.
 *
 * Unlike hooks seen in popular frameworks like React, you provide an exact `key` so
 * we can call `prism.memo` in any order, and conditionally.
 *
 * @param deps - Passing in `undefined` will always cause a recompute
 */
function memo<T>(
  key: string,
  fn: () => T,
  deps: undefined | $IntentionalAny[] | ReadonlyArray<$IntentionalAny>,
): T {
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`prism.memo() is called outside of a prism() call.`)
  }

  let memo = scope.memos.get(key)
  if (memo === undefined) {
    memo = {
      cachedValue: null,
      // undefined will always indicate "deps have changed", so we set it's initial value as such
      deps: undefined,
    }
    scope.memos.set(key, memo)
  }

  if (depsHaveChanged(memo.deps, deps)) {
    startIgnoringDependencies()

    memo.cachedValue = safelyRun(fn, undefined).value
    stopIgnoringDependencies()
    memo.deps = deps
  }

  return memo.cachedValue as $IntentionalAny as T
}

/**
 * A state hook, similar to react's `useState()`.
 *
 * @param key - the key for the state
 * @param initialValue - the initial value
 * @returns [currentState, setState]
 *
 * @example
 * ```ts
 * import {prism} from 'dataverse'
 *
 * // This derivation holds the current mouse position and updates when the mouse moves
 * const mousePositionD = prism(() => {
 *   const [pos, setPos] = prism.state<[x: number, y: number]>('pos', [0, 0])
 *
 *   prism.effect(
 *     'setupListeners',
 *     () => {
 *       const handleMouseMove = (e: MouseEvent) => {
 *         setPos([e.screenX, e.screenY])
 *       }
 *       document.addEventListener('mousemove', handleMouseMove)
 *
 *       return () => {
 *         document.removeEventListener('mousemove', handleMouseMove)
 *       }
 *     },
 *     [],
 *   )
 *
 *   return pos
 * })
 * ```
 */
function state<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const {b, setValue} = prism.memo(
    'state/' + key,
    () => {
      const b = new Box<T>(initialValue)
      const setValue = (val: T) => b.set(val)
      return {b, setValue}
    },
    [],
  )

  return [b.derivation.getValue(), setValue]
}

/**
 * This is useful to make sure your code is running inside a `prism()` call.
 *
 * @example
 * ```ts
 * import {prism} from '@theatre/dataverse'
 *
 * function onlyUsefulInAPrism() {
 *   prism.ensurePrism()
 * }
 *
 * prism(() => {
 *   onlyUsefulInAPrism() // will run fine
 * })
 *
 * setTimeout(() => {
 *   onlyUsefulInAPrism() // throws an error
 *   console.log('This will never get logged')
 * }, 0)
 * ```
 */
function ensurePrism(): void {
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`The parent function is called outside of a prism() call.`)
  }
}

function scope<T>(key: string, fn: () => T): T {
  const parentScope = hookScopeStack.peek()
  if (!parentScope) {
    throw new Error(`prism.scope() is called outside of a prism() call.`)
  }
  const subScope = parentScope.sub(key)
  hookScopeStack.push(subScope)
  const ret = safelyRun(fn, undefined).value
  hookScopeStack.pop()
  return ret as $IntentionalAny as T
}

function sub<T>(
  key: string,
  fn: () => T,
  deps: undefined | $IntentionalAny[],
): T {
  return memo(key, () => prism(fn), deps).getValue()
}

function inPrism(): boolean {
  return !!hookScopeStack.peek()
}

type IPrismFn = {
  <T>(fn: () => T): IDerivation<T>
  ref: typeof ref
  effect: typeof effect
  memo: typeof memo
  ensurePrism: typeof ensurePrism
  state: typeof state
  scope: typeof scope
  sub: typeof sub
  inPrism: typeof inPrism
}

/**
 * Creates a derivation from the passed function that adds all derivations referenced
 * in it as dependencies, and reruns the function when these change.
 *
 * @param fn - The function to rerun when the derivations referenced in it change.
 */
const prism: IPrismFn = (fn) => {
  return new PrismDerivation(fn)
}

prism.ref = ref
prism.effect = effect
prism.memo = memo
prism.ensurePrism = ensurePrism
prism.state = state
prism.scope = scope
prism.sub = sub
prism.inPrism = inPrism

export default prism
