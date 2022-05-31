import {Observable, Subscription} from 'rxjs'
import {map, switchMap, tap} from 'rxjs/operators'
import type {Observer} from 'rxjs'
import type {ILogger} from '@theatre/shared/logger'

function subscribeSwitch<T>(
  parentSub: Subscription,
  obs: Observable<T>,
  observer: (value: T, sub: Subscription) => void,
) {
  let sub = Subscription.EMPTY
  parentSub.add(() => sub.unsubscribe())
  parentSub.add(
    obs.subscribe((next) => {
      sub.unsubscribe()
      sub = new Subscription()
      observer(next, sub)
    }),
  )
}

declare module 'rxjs' {
  interface Observable<T> {
    map$<R>(project: (value: T) => R): Observable<R>
    /** Flattens the observable based on previous return, but it unsubscribes the previous observable "switching" from it. */
    switchMap$<R>(project: (value: T) => Observable<R>): Observable<R>
    /**
     * @deprecated for use at Theatre.js Studio
     * Please use `.subscribe$(parentSub, listenFn)` {@link Observable.subscribe$} method which takes a parent subscription as a required argument.
     */
    subscribe(
      arg: Partial<Observer<T>> | ((value: T) => void) | null,
    ): Subscription
    /** Theatre.js custom subscribe function which will require a subscription passed in. */
    subscribe$(
      parentSub: Subscription,
      observer: Partial<Observer<T>> | ((value: T) => void) | null,
    ): void
    /**
     * Theatre.js custom subscribe function which will require a subscription passed in.
     * And, on each emit, it will pass in a subscription that will be open until the next emit happens.
     */
    subscribeSwitch$(
      parentSub: Subscription,
      onNext: (value: T, valueSub: Subscription) => void,
    ): void
    /** Inspect the observable */
    _debugTo$(logger: ILogger, message?: string): Observable<T>
  }

  // @ts-ignore: TypeScript gets a little upset when we extend an already declared class
  class Subscription {
    /**
     * Subscription.TODO gives you a new subscription.
     * Use this constructor to indicate that you intend or this subscription to be managed properly in the future.
     */
    static get TODO(): Subscription
  }
}

// Observable
Observable.prototype.map$ = function map$(project) {
  return this.pipe(map(project))
}
Observable.prototype.switchMap$ = function switchMap$(project) {
  return this.pipe(switchMap(project))
}
Observable.prototype.subscribe$ = function subscribe$(parentSub, observer) {
  return parentSub.add(this.subscribe(observer))
}
Observable.prototype.subscribeSwitch$ = function subscribeSwitch$(
  parentSub,
  onNext,
) {
  subscribeSwitch(parentSub, this, onNext)
}
Observable.prototype._debugTo$ = function log$(logger, message = 'log$') {
  return this.pipe(tap((value) => logger._debug(message, value)))
}

// Subscription
Object.defineProperty(Subscription, 'TODO', {
  // needs to be a getter to ensure you can't unsubscribe the static TODO
  get: () => new Subscription(),
})
