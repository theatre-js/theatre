import Emitter from '$shared/DataVerse/utils/Emitter'
import {PointerDerivation} from '../pointer'
import {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import {ExtendDerivedDict} from './extend'
import {ArrayAtom} from '$shared/DataVerse/atoms/arrayAtom'
import AbstractDerivedArray from '$shared/DataVerse/derivations/arrays/AbstractDerivedArray'
import {
  KeysOfDerivedDictDerivation,
  default as keysOfDerivedDict,
} from '$shared/DataVerse/derivations/dicts/keysOfDerivedDict'

export type DerivedDictChangeType<O> = {
  addedKeys: Array<keyof O>
  deletedKeys: Array<keyof O>
}

export type PropOfADD<V> = V extends DictAtom<infer O>
  ? AbstractDerivedDict<O>
  : V extends ArrayAtom<infer T>
    ? AbstractDerivedArray<T>
    : V extends AbstractDerivedDict<infer T>
      ? AbstractDerivedDict<T>
      : V extends AbstractDerivedArray<infer T>
        ? AbstractDerivedArray<T>
        : V extends BoxAtom<infer T> ? T : V

export default abstract class AbstractDerivedDict<O> {
  isDerivedDict = true
  _o: O
  _changeEmitter: Emitter<DerivedDictChangeType<O>>
  _changeEmitterHasTappers: boolean

  _trace: $IntentionalAny
  _pointer: undefined | PointerDerivation<this>

  abstract _reactToHavingTappers(): void
  abstract _reactToNotHavingTappers(): void
  abstract keys(): Array<keyof O>
  abstract prop<K extends keyof O>(key: K): AbstractDerivation<PropOfADD<O[K]>>

  constructor() {
    if (process.env.KEEPING_DERIVATION_TRACES === true) {
      this._trace = new Error('trace')
    }
    this._changeEmitter = new Emitter()
    this._changeEmitterHasTappers = false
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfChangeTappersChange()
    })
    this._pointer = undefined
  }

  _reactToNumberOfChangeTappersChange() {
    const hasTappers = this._changeEmitter.hasTappers()
    if (hasTappers === this._changeEmitterHasTappers) return
    this._changeEmitterHasTappers = hasTappers
    if (hasTappers) {
      this._reactToHavingTappers()
    } else {
      this._reactToNotHavingTappers()
    }
  }

  changes() {
    return this._changeEmitter.tappable
  }

  pointer(): PointerDerivation<AbstractDerivedDict<O>> {
    const cachedPointer = this._pointer
    if (!cachedPointer) {
      const p = pointer.default({type: 'WithPath', root: this, path: []})
      this._pointer = p
      return p
    } else {
      return cachedPointer
    }
  }

  proxy(): $IntentionalAny {
    return proxyDerivedDict.default(this as $IntentionalAny)
  }

  extend<R>(x: AbstractDerivedDict<R>): ExtendDerivedDict<O, R> {
    return extend.default(this, x)
  }

  mapValues(fn: $IntentionalAny): $IntentionalAny {
    return mapValues.default(this as $IntentionalAny, fn)
  }

  toJS() {
    throw new Error('Not implemented') // @todo
  }

  keysD(): KeysOfDerivedDictDerivation<O> {
    return keysOfDerivedDict(this)
  }
}

export type DerivedDictTypeOf<O> = O extends DictAtom<infer OO> ? AbstractDerivedDict<OO> : never

const pointer = require('$shared/DataVerse/derivations/pointer')
const proxyDerivedDict = require('./proxyDerivedDict')
const extend = require('./extend')
const mapValues = require('./mapValues')
