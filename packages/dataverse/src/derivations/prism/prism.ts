import type Ticker from '../../Ticker'
import type {$IntentionalAny, VoidFn} from '../../types'
import Stack from '../../utils/Stack'
import type {Prism} from '../Interface'
import {isPrism} from '../Interface'
import {
  startIgnoringDependencies,
  stopIgnoringDependencies,
  pushCollector,
  popCollector,
  reportResolutionStart,
  reportResolutionEnd,
} from './discoveryMechanism'

type IDependent = (msgComingFrom: Prism<$IntentionalAny>) => void

const voidFn = () => {}

class HotHandle<V> {
  private _didMarkDependentsAsStale: boolean = false
  private _isFresh: boolean = false
  protected _cacheOfDendencyValues: Map<Prism<unknown>, unknown> = new Map()

  /**
   * @internal
   */
  protected _dependents: Set<IDependent> = new Set()

  /**
   * @internal
   */
  protected _dependencies: Set<Prism<$IntentionalAny>> = new Set()

  protected _possiblyStaleDeps = new Set<Prism<unknown>>()

  private _scope: HotScope = new HotScope(
    this as $IntentionalAny as HotHandle<unknown>,
  )

  /**
   * @internal
   */
  protected _lastValue: undefined | V = undefined

  /**
   * If true, the derivation is stale even though its dependencies aren't
   * marked as such. This is used by `prism.source()` and `prism.state()`
   * to mark the prism as stale.
   */
  private _forciblySetToStale: boolean = false

  constructor(
    private readonly _fn: () => V,
    private readonly _prismInstance: PrismDerivation<V>,
  ) {
    for (const d of this._dependencies) {
      d._addDependent(this._reactToDependencyGoingStale)
    }

    startIgnoringDependencies()
    this.getValue()
    stopIgnoringDependencies()
  }

  get hasDependents(): boolean {
    return this._dependents.size > 0
  }
  removeDependent(d: IDependent) {
    this._dependents.delete(d)
  }
  addDependent(d: IDependent) {
    this._dependents.add(d)
  }

  destroy() {
    for (const d of this._dependencies) {
      d._removeDependent(this._reactToDependencyGoingStale)
    }
    cleanupScopeStack(this._scope)
  }

  getValue(): V {
    if (!this._isFresh) {
      const newValue = this._recalculate()
      this._lastValue = newValue
      this._isFresh = true
      this._didMarkDependentsAsStale = false
      this._forciblySetToStale = false
    }
    return this._lastValue!
  }

  _recalculate() {
    let value: V

    if (!this._forciblySetToStale) {
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
          return this._lastValue!
        }
      }
    }

    const newDeps: Set<Prism<unknown>> = new Set()
    this._cacheOfDendencyValues.clear()

    const collector = (observedDep: Prism<unknown>): void => {
      newDeps.add(observedDep)
      this._addDependency(observedDep)
    }

    pushCollector(collector)

    hookScopeStack.push(this._scope)
    try {
      value = this._fn()
    } catch (error) {
      console.error(error)
    } finally {
      const topOfTheStack = hookScopeStack.pop()
      if (topOfTheStack !== this._scope) {
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

  forceStale() {
    this._forciblySetToStale = true
    this._markAsStale()
  }

  protected _reactToDependencyGoingStale = (which: Prism<$IntentionalAny>) => {
    this._possiblyStaleDeps.add(which)

    this._markAsStale()
  }

  private _markAsStale() {
    if (this._didMarkDependentsAsStale) return

    this._didMarkDependentsAsStale = true
    this._isFresh = false

    for (const dependent of this._dependents) {
      dependent(this._prismInstance)
    }
  }

  /**
   * @internal
   */
  protected _addDependency(d: Prism<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    d._addDependent(this._reactToDependencyGoingStale)
  }

  /**
   * @internal
   */
  protected _removeDependency(d: Prism<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    d._removeDependent(this._reactToDependencyGoingStale)
  }
}

const emptyObject = {}

class PrismDerivation<V> implements Prism<V> {
  /**
   * Whether the object is a derivation.
   */
  readonly isPrism: true = true

  private _state:
    | {hot: false; handle: undefined}
    | {hot: true; handle: HotHandle<V>} = {
    hot: false,
    handle: undefined,
  }

  constructor(private readonly _fn: () => V) {}

  /**
   * Whether the derivation is hot.
   */
  get isHot(): boolean {
    return this._state.hot
  }

  onChange(
    ticker: Ticker,
    listener: (v: V) => void,
    immediate: boolean = false,
  ): VoidFn {
    const dependent = () => {
      ticker.onThisOrNextTick(refresh)
    }

    let lastValue = emptyObject

    const refresh = () => {
      const newValue = this.getValue()
      if (newValue === lastValue) return

      lastValue = newValue
      listener(newValue)
    }

    this._addDependent(dependent)

    if (immediate) {
      lastValue = this.getValue()
      listener(lastValue as $IntentionalAny as V)
    }

    const unsubscribe = () => {
      this._removeDependent(dependent)
    }

    return unsubscribe
  }

  /**
   * Returns a tappable that fires every time the prism's state goes from `fresh-\>stale.`
   */
  onStale(callback: () => void): VoidFn {
    const untap = () => {
      this._removeDependent(fn)
    }
    const fn = () => callback()
    this._addDependent(fn)
    return untap
  }

  /**
   * Keep the derivation hot, even if there are no tappers (subscribers).
   */
  keepHot() {
    return this.onStale(() => {})
  }

  /**
   * Add a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be made a dependent of this derivation.
   *
   * @see _removeDependent
   */
  _addDependent(d: IDependent) {
    if (!this._state.hot) {
      this._goHot()
    }
    this._state.handle!.addDependent(d)
  }

  private _goHot() {
    const hotHandle = new HotHandle(this._fn, this)
    this._state = {
      hot: true,
      handle: hotHandle,
    }
  }

  /**
   * Remove a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be removed from as a dependent of this derivation.
   *
   * @see _addDependent
   */
  _removeDependent(d: IDependent) {
    const state = this._state
    if (!state.hot) {
      return
    }
    const handle = state.handle
    handle.removeDependent(d)
    if (!handle.hasDependents) {
      this._state = {hot: false, handle: undefined}
      handle.destroy()
    }
  }

  /**
   * Gets the current value of the derivation. If the value is stale, it causes the derivation to freshen.
   */
  getValue(): V {
    /**
     * TODO We should prevent (or warn about) a common mistake users make, which is reading the value of
     * a derivation in the body of a react component (e.g. `der.getValue()` (often via `val()`) instead of `useVal()`
     * or `uesPrism()`).
     *
     * Although that's the most common example of this mistake, you can also find it outside of react components.
     * Basically the user runs `der.getValue()` assuming the read is detected by a wrapping prism when it's not.
     *
     * Sometiems the derivation isn't even hot when the user assumes it is.
     *
     * We can fix this type of mistake by:
     * 1. Warning the user when they call `getValue()` on a cold derivation.
     * 2. Warning the user about calling `getValue()` on a hot-but-stale derivation
     *    if `getValue()` isn't called by a known mechanism like a `DerivationEmitter`.
     *
     * Design constraints:
     * - This fix should not have a perf-penalty in production. Perhaps use a global flag + `process.env.NODE_ENV !== 'production'`
     *   to enable it.
     * - In the case of `DerivationValuelessEmitter`, we don't control when the user calls
     *   `getValue()` (as opposed to `DerivationEmitter` which calls `getValue()` directly).
     *   Perhaps we can disable the check in that case.
     * - Probably the best place to add this check is right here in this method plus some changes to `reportResulutionStart()`,
     *   which would have to be changed to let the caller know if there is an actual collector (a prism)
     *   present in its stack.
     */
    reportResolutionStart(this)

    const state = this._state

    let val: V
    if (state.hot) {
      val = state.handle.getValue()
    } else {
      val = calculateColdPrism(this._fn)
    }

    reportResolutionEnd(this)
    return val
  }
}

interface PrismScope {
  effect(key: string, cb: () => () => void, deps?: unknown[]): void
  memo<T>(
    key: string,
    fn: () => T,
    deps: undefined | $IntentionalAny[] | ReadonlyArray<$IntentionalAny>,
  ): T
  state<T>(key: string, initialValue: T): [T, (val: T) => void]
  ref<T>(key: string, initialValue: T): IRef<T>
  sub(key: string): PrismScope
  source<V>(subscribe: (fn: (val: V) => void) => VoidFn, getValue: () => V): V
}

class HotScope implements PrismScope {
  constructor(private readonly _hotHandle: HotHandle<unknown>) {}

  protected readonly _refs: Map<string, IRef<unknown>> = new Map()
  ref<T>(key: string, initialValue: T): IRef<T> {
    let ref = this._refs.get(key)
    if (ref !== undefined) {
      return ref as $IntentionalAny as IRef<T>
    } else {
      const ref = {
        current: initialValue,
      }
      this._refs.set(key, ref)
      return ref
    }
  }
  isPrismScope = true

  // NOTE probably not a great idea to eager-allocate all of these objects/maps for every scope,
  // especially because most wouldn't get used in the majority of cases. However, back when these
  // were stored on weakmaps, they were uncomfortable to inspect in the debugger.
  readonly subs: Record<string, HotScope> = {}
  readonly effects: Map<string, IEffect> = new Map()

  effect(key: string, cb: () => () => void, deps?: unknown[]): void {
    let effect = this.effects.get(key)
    if (effect === undefined) {
      effect = {
        cleanup: voidFn,
        deps: undefined,
      }
      this.effects.set(key, effect)
    }

    if (depsHaveChanged(effect.deps, deps)) {
      effect.cleanup()

      startIgnoringDependencies()
      effect.cleanup = safelyRun(cb, voidFn).value
      stopIgnoringDependencies()
      effect.deps = deps
    }
    /**
     * TODO: we should cleanup dangling effects too.
     * Example:
     * ```ts
     * let i = 0
     * prism(() => {
     *   if (i === 0) prism.effect("this effect will only run once", () => {}, [])
     *   i++
     * })
     * ```
     */
  }

  readonly memos: Map<string, IMemo> = new Map()

  memo<T>(
    key: string,
    fn: () => T,
    deps: undefined | $IntentionalAny[] | ReadonlyArray<$IntentionalAny>,
  ): T {
    let memo = this.memos.get(key)
    if (memo === undefined) {
      memo = {
        cachedValue: null,
        // undefined will always indicate "deps have changed", so we set its initial value as such
        deps: undefined,
      }
      this.memos.set(key, memo)
    }

    if (depsHaveChanged(memo.deps, deps)) {
      startIgnoringDependencies()

      memo.cachedValue = safelyRun(fn, undefined).value
      stopIgnoringDependencies()
      memo.deps = deps
    }

    return memo.cachedValue as $IntentionalAny as T
  }

  state<T>(key: string, initialValue: T): [T, (val: T) => void] {
    const {value, setValue} = this.memo(
      'state/' + key,
      () => {
        const value = {current: initialValue}
        const setValue = (newValue: T) => {
          value.current = newValue
          this._hotHandle.forceStale()
        }
        return {value, setValue}
      },
      [],
    )

    return [value.current, setValue]
  }

  sub(key: string): HotScope {
    if (!this.subs[key]) {
      this.subs[key] = new HotScope(this._hotHandle)
    }
    return this.subs[key]
  }

  cleanupEffects() {
    for (const effect of this.effects.values()) {
      safelyRun(effect.cleanup, undefined)
    }
    this.effects.clear()
  }

  source<V>(subscribe: (fn: (val: V) => void) => VoidFn, getValue: () => V): V {
    const sourceKey = '$$source/blah'
    this.effect(
      sourceKey,
      () => {
        const unsub = subscribe(() => {
          this._hotHandle.forceStale()
        })
        return unsub
      },
      [subscribe],
    )
    return getValue()
  }
}

function cleanupScopeStack(scope: HotScope) {
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

  return scope.ref(key, initialValue)
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

  return scope.effect(key, cb, deps)
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

  return scope.memo(key, fn, deps)
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
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`prism.state() is called outside of a prism() call.`)
  }

  return scope.state(key, initialValue)
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

const possibleDerivationToValue = <P extends Prism<$IntentionalAny> | unknown>(
  input: P,
): P extends Prism<infer T> ? T : P => {
  if (isPrism(input)) {
    return input.getValue() as $IntentionalAny
  } else {
    return input as $IntentionalAny
  }
}

function source<V>(
  subscribe: (fn: (val: V) => void) => VoidFn,
  getValue: () => V,
): V {
  const scope = hookScopeStack.peek()
  if (!scope) {
    throw new Error(`prism.source() is called outside of a prism() call.`)
  }

  return scope.source(subscribe, getValue)
}

type IPrismFn = {
  <T>(fn: () => T): Prism<T>
  ref: typeof ref
  effect: typeof effect
  memo: typeof memo
  ensurePrism: typeof ensurePrism
  state: typeof state
  scope: typeof scope
  sub: typeof sub
  inPrism: typeof inPrism
  source: typeof source
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

class ColdScope implements PrismScope {
  effect(key: string, cb: () => () => void, deps?: unknown[]): void {
    console.warn(`prism.effect() does not run in cold prisms`)
  }
  memo<T>(
    key: string,
    fn: () => T,
    deps: any[] | readonly any[] | undefined,
  ): T {
    return fn()
  }
  state<T>(key: string, initialValue: T): [T, (val: T) => void] {
    return [initialValue, () => {}]
  }
  ref<T>(key: string, initialValue: T): IRef<T> {
    return {current: initialValue}
  }
  sub(key: string): ColdScope {
    return new ColdScope()
  }
  source<V>(subscribe: (fn: (val: V) => void) => VoidFn, getValue: () => V): V {
    return getValue()
  }
}

function calculateColdPrism<V>(fn: () => V): V {
  const scope = new ColdScope()
  hookScopeStack.push(scope)
  let value: V
  try {
    value = fn()
  } catch (error) {
    console.error(error)
  } finally {
    const topOfTheStack = hookScopeStack.pop()
    if (topOfTheStack !== scope) {
      console.warn(
        // @todo guide the user to report the bug in an issue
        `The Prism hook stack has slipped. This is a bug.`,
      )
    }
  }
  return value!
}

prism.ref = ref
prism.effect = effect
prism.memo = memo
prism.ensurePrism = ensurePrism
prism.state = state
prism.scope = scope
prism.sub = sub
prism.inPrism = inPrism
prism.source = source

export default prism
