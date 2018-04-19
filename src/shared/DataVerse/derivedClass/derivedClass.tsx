import DerivedClassInstance from '$shared/DataVerse/derivedClass/DerivedClassInstance'
import Ticker from '$shared/DataVerse/Ticker'
import Emitter from '$shared/DataVerse/utils/Emitter'
import {mapValues} from 'lodash'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

type Method = $FixMe

let lastId: number = 0

export class DerivedClass<O> {
  _id: number
  _methods: O
  _prototype: undefined | DerivedClass<$IntentionalAny>
  _changesToPrototypeEmitter: Emitter<DerivedClass<$IntentionalAny>>

  constructor(methods: O, prototype?: DerivedClass<$FixMe>) {
    this._id = lastId++
    this._methods = methods
    this._prototype = prototype
    this._changesToPrototypeEmitter = new Emitter()
  }

  prototypeChanges() {
    return this._changesToPrototypeEmitter.tappable
  }

  extend(methods: {}): DerivedClass<$FixMe> {
    return new DerivedClass(methods, this)
  }

  instance(ticker: Ticker): DerivedClassInstance<$FixMe> {
    return new DerivedClassInstance(this, ticker)
  }

  _getMethod(key: keyof O): Method {
    return this._methods[key]
  }

  getPrototype(): undefined | DerivedClass<any> {
    return this._prototype
  }

  setPrototype(p: DerivedClass<$FixMe>): void {
    this._prototype = p
    this._changesToPrototypeEmitter.emit(p)
  }

  keys(): {[k in keyof O]: void} {
    const parentKeys = this._prototype ? this._prototype.keys() : {}
    const ourKeys = mapValues(this._methods, () => undefined)
    return {...parentKeys, ...ourKeys} as $IntentionalAny
  }
}

interface DerivedClassFn {
  <O, P>(o: O, p: DerivedClass<P>): DerivedClass<Spread<O, P>>
  <O>(o: O): DerivedClass<O>
}

const derivedClass: DerivedClassFn = (
  o: $IntentionalAny,
  po?: $IntentionalAny,
) => new DerivedClass(o, po)

export default derivedClass

export type Classify<Super, O> = {
  [K in keyof O]: (
    self: Self<Super, O>,
  ) => O[K] | PointerDerivation<O[K]> | AbstractDerivation<O[K]>
} & {
  [K in keyof Super]?: (
    self: Self<Super, O>,
  ) => Super[K] | PointerDerivation<Super[K]> | AbstractDerivation<Super[K]>
}

interface Self<Super, O extends {}> {
  prop: <K extends keyof O | keyof Super>(
    k: K,
  ) => PointerDerivation<
    K extends keyof O ? O[K] : K extends keyof Super ? Super[K] : never
  >
  pointer: () => PointerDerivation<DerivedClassInstance<O>>
}
