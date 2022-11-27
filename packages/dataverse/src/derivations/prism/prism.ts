import Box from '../../Box'
import type Ticker from '../../Ticker'
import type {$IntentionalAny, VoidFn} from '../../types'
import Stack from '../../utils/Stack'
import type Tappable from '../../utils/Tappable'
import DerivationEmitter from '../DerivationEmitter'
import DerivationValuelessEmitter from '../DerivationValuelessEmitter'
import type {IDerivation} from '../IDerivation'
import {isDerivation} from '../IDerivation'
import {
  startIgnoringDependencies,
  stopIgnoringDependencies,
  pushCollector,
  popCollector,
  reportResolutionStart,
  reportResolutionEnd,
} from './discoveryMechanism'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void

const voidFn = () => {}

export class PrismDerivation<V> implements IDerivation<V> {
  protected _cacheOfDendencyValues: Map<IDerivation<unknown>, unknown> =
    new Map()
  protected _possiblyStaleDeps = new Set<IDerivation<unknown>>()
  private _prismScope = new PrismScope()

  /**
   * Whether the object is a derivation.
   */
  readonly isDerivation: true = true
  private _didMarkDependentsAsStale: boolean = false
  private _isHot: boolean = false

  private _isFresh: boolean = false

  /**
   * @internal
   */
  protected _lastValue: undefined | V = undefined

  /**
   * @internal
   */
  protected _dependents: Set<IDependent> = new Set()

  /**
   * @internal
   */
  protected _dependencies: Set<IDerivation<$IntentionalAny>> = new Set()

  constructor(readonly _fn: () => V) {}

  /**
   * Whether the derivation is hot.
   */
  get isHot(): boolean {
    return this._isHot
  }

  /**
   * @internal
   */
  protected _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._isHot) d.addDependent(this._markAsStale)
  }

  /**
   * @internal
   */
  protected _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._isHot) d.removeDependent(this._markAsStale)
  }

  /**
   * Returns a `Tappable` of the changes of this derivation.
   */
  changes(ticker: Ticker): Tappable<V> {
    return new DerivationEmitter(this, ticker).tappable()
  }

  /**
   * Like {@link AbstractDerivation.changes} but with a different performance model. `changesWithoutValues` returns a `Tappable` that
   * updates every time the derivation is updated, even if the value didn't change, and the callback is called without
   * the value. The advantage of this is that you have control over when the derivation is freshened, it won't
   * automatically be kept fresh.
   */
  changesWithoutValues(): Tappable<void> {
    return new DerivationValuelessEmitter(this).tappable()
  }

  /**
   * Keep the derivation hot, even if there are no tappers (subscribers).
   */
  keepHot() {
    return this.changesWithoutValues().tap(() => {})
  }

  /**
   * Convenience method that taps (subscribes to) the derivation using `this.changes(ticker).tap(fn)` and immediately calls
   * the callback with the current value.
   *
   * @param ticker - The ticker to use for batching.
   * @param fn - The callback to call on update.
   *
   * @see changes
   */
  tapImmediate(ticker: Ticker, fn: (cb: V) => void): VoidFn {
    const untap = this.changes(ticker).tap(fn)
    fn(this.getValue())
    return untap
  }

  /**
   * Add a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be made a dependent of this derivation.
   *
   * @see removeDependent
   */
  // TODO: document this better, what are dependents?
  addDependent(d: IDependent) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  /**
   * Remove a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be removed from as a dependent of this derivation.
   *
   * @see addDependent
   */
  removeDependent(d: IDependent) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  protected _markAsStale = (which: IDerivation<$IntentionalAny>) => {
    this._reactToDependencyBecomingStale(which)

    if (this._didMarkDependentsAsStale) return

    this._didMarkDependentsAsStale = true
    this._isFresh = false

    for (const dependent of this._dependents) {
      dependent(this)
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

    if (!this._isFresh) {
      const newValue = this._recalculate()
      this._lastValue = newValue
      if (this._isHot) {
        this._isFresh = true
        this._didMarkDependentsAsStale = false
      }
    }

    reportResolutionEnd(this)
    return this._lastValue!
  }

  private _reactToNumberOfDependentsChange() {
    const shouldBecomeHot = this._dependents.size > 0

    if (shouldBecomeHot === this._isHot) return

    this._isHot = shouldBecomeHot
    this._didMarkDependentsAsStale = false
    this._isFresh = false
    if (shouldBecomeHot) {
      for (const d of this._dependencies) {
        d.addDependent(this._markAsStale)
      }
      this._keepHot()
    } else {
      for (const d of this._dependencies) {
        d.removeDependent(this._markAsStale)
      }
      this._becomeCold()
    }
  }

  /**
   * A simple mapping function similar to Array.map()
   *
   * @deprecated This is a remnant of the old monadic api. Now it's functionally equal to `prism(() => fn(der.getValue()))`, so use that instead.
   */
  map<T>(fn: (v: V) => T): IDerivation<T> {
    console.log('map')

    return prism(() => fn(this.getValue()))
  }

  /**
   * Same as {@link AbstractDerivation.map}, but the mapping function can also return a derivation, in which case the derivation returned
   * by `flatMap` takes the value of that derivation.
   *
   * @deprecated This is a remnant of the old monadic api. Now it's functionally equal to `prism(() => val(fn(val(der))))`
   *
   * @example
   * ```ts
   * // Simply using map() here would return the inner derivation when we call getValue()
   * new Box(3).derivation.map((value) => new Box(value).derivation).getValue()
   *
   * // Using flatMap() eliminates the inner derivation
   * new Box(3).derivation.flatMap((value) => new Box(value).derivation).getValue()
   * ```
   *
   * @param fn - The mapping function to use. Note: it accepts a plain value, not a derivation.
   */
  flatMap<R>(
    fn: (v: V) => R,
  ): IDerivation<R extends IDerivation<infer T> ? T : R> {
    console.log('flatMap')
    return prism(() => {
      return possibleDerivationToValue(fn(this.getValue()))
    })
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

const possibleDerivationToValue = <
  P extends IDerivation<$IntentionalAny> | unknown,
>(
  input: P,
): P extends IDerivation<infer T> ? T : P => {
  if (isDerivation(input)) {
    return input.getValue() as $IntentionalAny
  } else {
    return input as $IntentionalAny
  }
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
