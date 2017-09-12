// @flow
import {default as CompositeAtom, type ICompositeAtom} from './utils/CompositeAtom'
import forEach from 'lodash/forEach'
import {type IAtom} from './utils/Atom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'
import mapValues from 'lodash/mapValues'
import {type AddressedChangeset} from '$shared/DataVerse/types'

// type DeepChangeType<O> = AddressedChangeset & {type: 'MapChange', newRefs: $Shape<O>}

type Unboxed<V> = $FixMe
type OldValNewValPair = <V>(v: V) => {oldValue: Unboxed<V>, newValue: Unboxed<V>}
type DeepDiffType<O> = AddressedChangeset & {type: 'MapDiff', newRefs: $Shape<$ObjMap<O, OldValNewValPair>>}

export interface IMapAtom<O: {}> extends ICompositeAtom {
  isMapAtom: true,
  set<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): MapAtom<O>,
  get<K: $Keys<O>>(key: K): $ElementType<O, K>,
  chnages: () => Tappable<$Shape<O>>,
  deepChanges: () => Tappable<AddressedChangeset>,
  deepDiffs: () => Tappable<DeepDiffType<O>>,
}

export default class MapAtom<O: {}> extends CompositeAtom implements IMapAtom<O> {
  isMapAtom = true
  _internalMap: O
  chnages: () => Tappable<$Shape<O>>
  _changeEmitter: Emitter<$Shape<O>>
  deepChanges: () => Tappable<AddressedChangeset>
  _deepChangeEmitter: Emitter<AddressedChangeset>
  deepDiffs: () => Tappable<DeepDiffType<O>>
  _deepDiffEmitter: Emitter<DeepDiffType<O>>

  constructor(o: O & {[key: string | number]: IAtom}) {
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
    const overriddenRefs = mapValues(o, (v, k) => {
      return this.get(k)
    })

    forEach(overriddenRefs, (v, k) => {
      if (v) {
        this._unadopt(k, v)
      }
    })

    forEach((o: O), (v, k) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })

    // if (this._deepDiffEmitter.hasTappers()) {
    //   this._deepDiffEmitter.emit(mapValues(o, (newValue, key) => {
    //     const oldValue = overriddenRefs[key]
    //     return {
    //       oldValue: oldValue ? oldValue.unboxDeep() : oldValue,
    //       newValue: newValue ? newValue.unboxDeep() : newValue,
    //     }
    //   }))
    // }

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(o)
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'MapChange', newRefs: o})
    }

    return this
  }

  set<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V & IAtom): this {
    return this.assign({[key]: value})
  }

  get<K: $Keys<O>>(key: K): $ElementType<O, K> {
    return (this._internalMap[key]: $IntentionalAny)
  }
}