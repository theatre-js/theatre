import type {RxForView} from './best-practices'
import type {DevString} from './DevString'
import {ColdRx} from './ColdRx'
import {HotRx} from './HotRx'
import type {Outcome} from './types'

declare function check<T>(value: T): RxForView<T>

function hotColdTypeChecks() {
  // good
  check(new ColdRx<1>(null!).forView()).forView()
  check(new HotRx<1>(null!).forView()).forView()

  // bad
  check(new HotRx<1>(null!))
    // @ts-expect-error
    .forView()

  const hmm = new ColdRx<{set(id: string): void}>(null!)
    // @ts-expect-error for complicated set
    .forView()

  check({
    a: hmm,
  })
    // @ts-expect-error for hmm is any
    .forView()

  ColdRx
}
function typeChecks() {
  // good

  check({
    takesNoArg() {},
  }).forView()

  const rx = new ColdRx<number>(null!)
  const a = check({
    takesReasonArg(reason: DevString) {},

    toggleItem(): Outcome {
      return null!
    },

    rx: rx.forView(),

    // f: Promise.resolve(1)
  }).forView()
  a

  // bad

  check({
    returnsSomething() {
      return '23'
    },
  })
    //@ts-expect-error
    .forView()

  check({
    // promise: Promise.resolve(1),
    selector: {
      // takesNonReasonArg(value: number) {},
      a: [1, 3, {r: Promise.resolve(1)}],
    },
  })
    //@ts-expect-error
    .forView()

  check([]).forView()

  check({
    promise: Promise.resolve(1),
  })
    // @ts-expect-error
    .forView()

  check({
    takesNonReasonArg(itemId: string) {},
  })
    //@ts-expect-error
    .forView()

  check({
    takesReasonArgPlusExtra(reason: DevString, itemId: string) {},
  })
    //@ts-expect-error
    .forView()
}
