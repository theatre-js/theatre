import {BehaviorSubject, Observable} from 'rxjs'
import type {DevString} from '@theatre/studio/utils/DevString'
import type {Outcome} from './rxjs-mvvm'

declare function check<T>(value: T): Observable<T>

function nestedTypeChecks() {
  // good
  check(new BehaviorSubject<1>(null!).vm$()).vm$()
  check(new Observable<1>(null!).vm$()).vm$()

  // bad
  check(new BehaviorSubject<1>(null!))
    // @ts-expect-error
    .vm$()

  const hmm = new Observable<{set(id: string): void}>(null!)
    // @ts-expect-error for complicated set
    .vm$()

  check({
    a: hmm,
  })
    // @ts-expect-error for hmm is any
    .vm$()
}

function typeChecks() {
  // good

  check({
    takesNoArg() {},
  }).vm$()

  const rx = new Observable<number>(null!)
  const a = check({
    takesReasonArg(reason: DevString) {},

    toggleItem(): Outcome {
      return null!
    },

    rx: rx.vm$(),
  }).vm$()

  // bad

  check({
    returnsSomething() {
      return '23'
    },
  })
    //@ts-expect-error
    .vm$()

  check({
    // promise: Promise.resolve(1),
    selector: {
      // takesNonReasonArg(value: number) {},
      a: [1, 3, {r: Promise.resolve(1)}],
    },
  })
    //@ts-expect-error
    .vm$()

  check([]).vm$()

  check({
    promise: Promise.resolve(1),
  })
    // @ts-expect-error
    .vm$()

  check({
    takesNonReasonArg(itemId: string) {},
  })
    //@ts-expect-error
    .vm$()

  check({
    takesReasonArgPlusExtra(reason: DevString, itemId: string) {},
  })
    //@ts-expect-error
    .vm$()
}
