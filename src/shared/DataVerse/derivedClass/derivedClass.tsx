import DerivedClassInstance from '$src/shared/DataVerse/derivedClass/DerivedClassInstance'
import {MapKey} from '$src/shared/DataVerse/types'
import Ticker from '$src/shared/DataVerse/Ticker'
import Emitter from '$src/shared/DataVerse/utils/Emitter'
import {mapValues} from 'lodash'

type Method = $FixMe

let lastId: number = 0

export class DerivedClass<O> {
  _id: number
  _methods: {[key: string]: Method}
  _prototype: void | DerivedClass<$FixMe>
  _changesToPrototypeEmitter: $FixMe

  constructor(methods: O, prototype?: DerivedClass<$FixMe>) {
    this._id = lastId++
    this._methods = methods
    this._prototype = prototype
    this._changesToPrototypeEmitter = new Emitter()
    return this
  }

  prototypeChanges() {
    return this._changesToPrototypeEmitter.tappable
  }

  extend(methods: {}): DerivedClass<$FixMe> {
    return new DerivedClass(methods, this)
  }

  instance(ticker: Ticker): DerivedClassInstance {
    return new DerivedClassInstance(this, ticker)
  }

  _getMethod(key: MapKey): Method {
    return this._methods[key]
  }

  getPrototype(): void | DerivedClass<any> {
    return this._prototype
  }

  setPrototype(p: DerivedClass<$FixMe>): void {
    this._prototype = p
    this._changesToPrototypeEmitter.emit(p)
  }

  keys(): {[k: keyof O]: void} {
    const parentKeys = this._prototype ? this._prototype.keys() : {}
    const ourKeys = mapValues(this._methods, () => undefined)
    return {...parentKeys, ...ourKeys}
  }
}

export default function derivedClass<O>(o: O) {
  return new DerivedClass(o)
}
