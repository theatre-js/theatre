import {BehaviorSubject, Observable} from 'rxjs'
import type {DevString} from './DevString'
import type {Outcome} from './rxjs-mvvm'

declare function check<T>(value: T): Observable<T>

function nestedTypeChecks() {
  // good
  check(new BehaviorSubject<1>(null!).view$()).view$()
  check(new Observable<1>(null!).view$()).view$()

  // bad
  check(new BehaviorSubject<1>(null!))
    // @ts-expect-error
    .view$()

  const hmm = new Observable<{set(id: string): void}>(null!)
    // @ts-expect-error for complicated set
    .view$()

  check({
    a: hmm,
  })
    // @ts-expect-error for hmm is any
    .view$()
}

function typeChecks() {
  // good

  check({
    takesNoArg() {},
  }).view$()

  const rx = new Observable<number>(null!)
  const a = check({
    takesReasonArg(reason: DevString) {},

    toggleItem(): Outcome {
      return null!
    },

    rx: rx.view$(),
  }).view$()

  // bad

  check({
    returnsSomething() {
      return '23'
    },
  })
    //@ts-expect-error
    .view$()

  check({
    // promise: Promise.resolve(1),
    selector: {
      // takesNonReasonArg(value: number) {},
      a: [1, 3, {r: Promise.resolve(1)}],
    },
  })
    //@ts-expect-error
    .view$()

  check([]).view$()

  check({
    promise: Promise.resolve(1),
  })
    // @ts-expect-error
    .view$()

  check({
    takesNonReasonArg(itemId: string) {},
  })
    //@ts-expect-error
    .view$()

  check({
    takesReasonArgPlusExtra(reason: DevString, itemId: string) {},
  })
    //@ts-expect-error
    .view$()
}
