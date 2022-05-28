import {arrRemove} from './utils/arrRemove'

export type TeardownLogic = DisposableLike | (() => void) | void

export interface DisposableLike {
  dispose(): void
}

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Disposable has one important method, `dispose`, that takes no argument
 * and just disposes the resource held by the disposable.
 *
 * Additionally, disposables may be grouped together through the `add()`
 * method, which will attach a child Disposable to the current Disposable.
 * When a Disposable is disposed, all its children (and its grandchildren)
 * will be disposed as well.
 */
export class Disposable implements DisposableLike {
  /** */
  public static EMPTY = (() => {
    const empty = new Disposable()
    empty.closed = true
    return empty
  })()

  /**
   * A flag to indicate whether this Disposable has already been disposed.
   */
  public closed = false

  private _parentage: Disposable[] | Disposable | null = null

  /**
   * The list of registered finalizers to execute upon undisposable. Adding and removing from this
   * list occurs in the {@link #add} and {@link #remove} methods.
   */
  private _finalizers: TeardownLogic[] | null = null

  /**
   * @param initialTeardown A function executed first as part of the finalization
   * process that is kicked off when {@link #dispose} is called.
   */
  constructor(private initialTeardown?: () => void) {}

  /**
   * Disposes the resources held by the disposable. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Disposable was created.
   * @return {void}
   */
  dispose(): void {
    let errors: any[] | undefined

    if (!this.closed) {
      this.closed = true

      // Remove this from it's parents.
      const {_parentage} = this
      if (_parentage) {
        this._parentage = null
        if (Array.isArray(_parentage)) {
          for (const parent of _parentage) {
            parent.remove(this)
          }
        } else {
          _parentage.remove(this)
        }
      }

      const {initialTeardown: initialFinalizer} = this
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer()
        } catch (e) {
          errors = e instanceof DisposeError ? e.errors : [e]
        }
      }

      const {_finalizers} = this
      if (_finalizers) {
        this._finalizers = null
        for (const finalizer of _finalizers) {
          try {
            execFinalizer(finalizer)
          } catch (err) {
            errors = errors ?? []
            if (err instanceof DisposeError) {
              errors = [...errors, ...err.errors]
            } else {
              errors.push(err)
            }
          }
        }
      }

      if (errors) {
        throw new DisposeError(errors)
      }
    }
  }

  /**
   * Adds a finalizer to this disposable, so that finalization will be disposed/called
   * when this disposable is disposed. If this disposable is already {@link #closed},
   * because it has already been disposed, then whatever finalizer is passed to it
   * will automatically be executed (unless the finalizer itself is also a closed disposable).
   *
   * Closed Disposables cannot be added as finalizers to any disposable. Adding a closed
   * disposable to a any disposable will result in no operation. (A noop).
   *
   * Adding a disposable to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * `Disposable` instances that are added to this instance will automatically remove themselves
   * if they are disposed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link #remove}
   *
   * @param teardown The finalization logic to add to this disposable.
   */
  add(teardown: TeardownLogic): void {
    // Only add the finalizer if it's not undefined
    // and don't add a disposable to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this disposable is already closed,
        // execute whatever finalizer is handed to it automatically.
        execFinalizer(teardown)
      } else {
        if (teardown instanceof Disposable) {
          // We don't add closed disposables, and we don't add the same disposable
          // twice. Disposable dispose is idempotent.
          if (teardown.closed || teardown._hasParent(this)) {
            return
          }
          teardown._addParent(this)
        }
        ;(this._finalizers = this._finalizers ?? []).push(teardown)
      }
    }
  }

  /**
   * Checks to see if a this disposable already has a particular parent.
   * This will signal that this disposable has already been added to the parent in question.
   * @param parent - the parent to check for
   */
  private _hasParent(parent: Disposable) {
    const {_parentage} = this
    return (
      _parentage === parent ||
      (Array.isArray(_parentage) && _parentage.includes(parent))
    )
  }

  /**
   * Adds a parent to this disposable so it can be removed from the parent if it
   * disposes on it's own.
   *
   * NOTE: THIS ASSUMES THAT {@link _hasParent} HAS ALREADY BEEN CHECKED.
   * @param parent - The parent disposable to add
   */
  private _addParent(parent: Disposable) {
    const {_parentage} = this
    this._parentage = Array.isArray(_parentage)
      ? (_parentage.push(parent), _parentage)
      : _parentage
      ? [_parentage, parent]
      : parent
  }

  /**
   * Called on a child when it is removed via {@link #remove}.
   * @param parent - The parent to remove
   */
  private _removeParent(parent: Disposable) {
    const {_parentage} = this
    if (_parentage === parent) {
      this._parentage = null
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent)
    }
  }

  /**
   * Removes a finalizer from this disposable that was previously added with the {@link #add} method.
   *
   * Note that `Disposable` instances, when disposed, will automatically remove themselves
   * from every other `Disposable` they have been added to. This means that using the `remove` method
   * is not a common thing and should be used thoughtfully.
   *
   * If you add the same finalizer instance of a function or an unsubscribable object to a `Subcription` instance
   * more than once, you will need to call `remove` the same number of times to remove all instances.
   *
   * All finalizer instances are removed to free up memory upon undisposable.
   *
   * @param teardown The finalizer to remove from this disposable
   */
  remove(teardown: Exclude<TeardownLogic, void>): void {
    const {_finalizers} = this
    _finalizers && arrRemove(_finalizers, teardown)

    if (teardown instanceof Disposable) {
      teardown._removeParent(this)
    }
  }
}

export const EMPTY_SUBSCRIPTION = Disposable.EMPTY

export function isDisposable(value: any): value is Disposable {
  return (
    value instanceof Disposable ||
    (value &&
      'closed' in value &&
      isFunction(value.remove) &&
      isFunction(value.add) &&
      isFunction(value.dispose))
  )
}
/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Disposable}.
 */
export class DisposeError extends Error {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
   */
  constructor(public readonly errors: (Error | string)[]) {
    super()
    this.message = errors
      ? `${errors.length} errors occurred during dispose:
    ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
      : ''
    this.name = 'DisposeError'
  }
}

export function execFinalizer(finalizer: TeardownLogic) {
  if (finalizer === undefined) return
  if (isFunction(finalizer)) {
    finalizer()
  } else {
    finalizer.dispose()
  }
}

/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}
