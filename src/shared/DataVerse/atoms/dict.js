
import {default as AbstractCompositeAtom} from './utils/AbstractCompositeAtom'  // eslint-disable-line flowtype/require-valid-file-annotation
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import type {IAtom} from './utils/AbstractAtom'
import Tappable from '$shared/DataVerse/utils/Tappable'
// import Emitter from '$shared/DataVerse/utils/Emitter'
import type {AddressedChangeset, True, False} from '$shared/DataVerse/types'
import deriveFromDictAtom from '$shared/DataVerse/derivations/dicts/deriveFromDictAtom'
import {type DecidePointerType, default as pointer} from '$shared/DataVerse/derivations/pointer'

type Unboxed<O> = $FixMe // eslint-disable-line no-unused-vars
export type DictAtomChangeType<O: {}> = {overriddenRefs: $Shape<O>, deletedKeys: Array<$Keys<O>>, addedKeys: Array<$Keys<O>>}
export type DictAtomDeepChangeType<O> = AddressedChangeset & {type: 'MapChange'} & DictAtomChangeType<O>
export type DictAtomDeepDiffType<O> = AddressedChangeset & {type: 'MapDiff', deepUnboxOfOldRefs: Unboxed<O>, deepUnboxOfNewRefs: Unboxed<O>, deletedKeys: Array<$Keys<O>>}

export type IsDictAtom<V> = $ElementType<V, 'isDictAtom'>

export type IDictAtom<O: {}> = {
  isDictAtom: True,
  isBoxAtom: False,
  isArrayAtom: False,
  _internalMap: O,
  setProp<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): DictAtom<O>,
  prop<K: $Keys<O>>(key: K): $ElementType<O, K>,
  deleteProp<K: $Keys<O>>(key: K): DictAtom<O>,

  changes: () => Tappable<DictAtomChangeType<O>>,
  forEach: <K: $Keys<O>>(fn: ($ElementType<O, K>, K) => void | false) => void,
  keys: () => Array<$Keys<O>>,
  derivedDict: () => $FixMe,
  pointer(): DecidePointerType<IDictAtom<O>>,
}

export class DictAtom<O: {}> extends AbstractCompositeAtom {
  isDictAtom = 'True'
  _internalMap: O
  _pointer: ?$FixMe
  // pointer: () => DecidePointerType<IDictAtom<O>>
  // chnages: () => Tappable<DictAtomChangeType<O>>
  // _changeEmitter: Emitter<DictAtomChangeType<O>>
  // keys: () => Array<$Keys<O>>
  // forEach: <K: $Keys<O>>(fn: ($ElementType<O, K>, K) => void | false) => void
  // derivedDict: () => $FixMe

  constructor(o: O): _IDictAtom<O> {
    super()
    this._internalMap = ({}: $IntentionalAny)
    this._pointer = undefined

    this._assignInitialValue(o)
    return this
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
    return deriveFromDictAtom(((this: $IntentionalAny): IDictAtom<O>))
  }

  pointer() {
    if (!this._pointer) {
      this._pointer = (pointer({root: this, path: []}): $IntentionalAny)
    }
    return this._pointer
  }
}

export default function dict<O: {}>(o: O): IDictAtom<O> {
  return (new DictAtom(o): $IntentionalAny)
}

export function isDictAtom(v) {
  return v instanceof DictAtom
}