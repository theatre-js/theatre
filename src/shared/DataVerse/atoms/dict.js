// @flow
import {default as AbstractCompositeAtom, type ICompositeAtom} from './utils/AbstractCompositeAtom'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import type {IAtom} from './utils/AbstractAtom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {AddressedChangeset} from '$shared/DataVerse/types'
import deriveFromDictAtom from '$shared/DataVerse/derivations/dicts/deriveFromDictAtom'

type Unboxed<O> = $FixMe // eslint-disable-line no-unused-vars
export type DictAtomChangeType<O: {}> = {overriddenRefs: $Shape<O>, deletedKeys: Array<$Keys<O>>, addedKeys: Array<$Keys<O>>}
export type DictAtomDeepChangeType<O> = AddressedChangeset & {type: 'MapChange'} & DictAtomChangeType<O>
export type DictAtomDeepDiffType<O> = AddressedChangeset & {type: 'MapDiff', deepUnboxOfOldRefs: Unboxed<O>, deepUnboxOfNewRefs: Unboxed<O>, deletedKeys: Array<$Keys<O>>}

export interface IDictAtom<O: {}> extends ICompositeAtom {
  isDictAtom: true,
  setProp<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): DictAtom<O>,
  prop<K: $Keys<O>>(key: K): $ElementType<O, K>,
  deleteProp<K: $Keys<O>>(key: K): DictAtom<O>,

  chnages: () => Tappable<DictAtomChangeType<O>>,
  forEach: <K: $Keys<O>>(fn: ($ElementType<O, K>, K) => void | false) => void,
  keys: () => Array<$Keys<O>>,
  derivedDict: () => $FixMe,
}

export class DictAtom<O: {}> extends AbstractCompositeAtom implements IDictAtom<O> {
  isDictAtom = true
  _internalMap: O
  chnages: () => Tappable<DictAtomChangeType<O>>
  _changeEmitter: Emitter<DictAtomChangeType<O>>
  keys: () => Array<$Keys<O>>
  forEach: <K: $Keys<O>>(fn: ($ElementType<O, K>, K) => void | false) => void
  derivedDict: () => $FixMe

  constructor(o: O) {
    super()
    this._internalMap = ({}: $IntentionalAny)

    this._assignInitialValue(o)
  }

  unboxDeep(): $FixMe {
    return mapValues(this._internalMap, (v) => v ? v.unboxDeep() : v)
  }

  _assignInitialValue(o: O) {
    forEach((o: O), (v, k) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })
  }

  assign(o: $Shape<O>): this {
    return this._change(o, [])
  }

  _change(o: $Shape<O>, keysToDelete: Array<$Keys<O>>): this {
    const addedKeys: Array<$Keys<O>> = []
    // $FixMe
    forEach(o, (v, k) => {
      if (!this._internalMap.hasOwnProperty(k)) {
        addedKeys.push(k)
      }
    })

    const overriddenRefs = mapValues(o, (v, k) => {
      return this.prop(k)
    })

    const deletedKeys = keysToDelete
    deletedKeys.forEach((propName) => {
      overriddenRefs[propName] = this.prop(propName)
    })

    forEach(overriddenRefs, (v, k) => {
      if (v) {
        this._unadopt(k, v)
      }
    })

    deletedKeys.forEach((key) => {
      delete this._internalMap[key]
    })

    forEach((o: O), (v, k) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit({overriddenRefs: o, deletedKeys: deletedKeys, addedKeys})
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'MapChange', overriddenRefs: o, deletedKeys, addedKeys})
    }

    if (this._deepDiffEmitter.hasTappers()) {
      this._deepDiffEmitter.emit({
        address: [],
        type: 'MapDiff',
        deepUnboxOfNewRefs: mapValues(o, (v) => v ? v.unboxDeep() : v),
        deepUnboxOfOldRefs: mapValues(overriddenRefs, (v) => v ? v.unboxDeep() : v),
        deletedKeys,
      })
    }

    return this
  }

  setProp<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V & IAtom): this {
    return this.assign({[key]: value})
  }

  prop<K: $Keys<O>>(key: K): $ElementType<O, K> {
    if (this._internalMap.hasOwnProperty(key)) {
      return (this._internalMap[key]: $IntentionalAny)
    } else {
      return undefined
    }
  }

  forEach<K: $Keys<O>>(fn: ($ElementType<O, K>, K) => void | false): void {
    forEach(this._internalMap, fn)
  }

  deleteProp<K: $Keys<O>>(key: K): this {
    return this._change({}, [key])
  }

  pointerTo(key: $Keys<O>) {
    return this.pointer().prop(key)
  }

  keys() {
    return Object.keys(this._internalMap)
  }

  derivedDict() {
    return deriveFromDictAtom(this)
  }
}

export default function dict<O: {}>(o: O): IDictAtom<O> {
  return new DictAtom(o)
}