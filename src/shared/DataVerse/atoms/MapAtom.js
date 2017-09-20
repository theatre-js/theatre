// @flow
import {default as CompositeAtom, type ICompositeAtom} from './utils/CompositeAtom'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import type {IAtom} from './utils/Atom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {AddressedChangeset, MapAtomChangeType} from '$shared/DataVerse/types'

type Unboxed<O> = $FixMe // eslint-disable-line no-unused-vars
export type MapAtomDeepChangeType<O> = AddressedChangeset & {type: 'MapChange'} & MapAtomChangeType<O>
export type MapAtomDeepDiffType<O> = AddressedChangeset & {type: 'MapDiff', deepUnboxOfOldRefs: Unboxed<O>, deepUnboxOfNewRefs: Unboxed<O>, deletedKeys: Array<$Keys<O>>}

export interface IMapAtom<O: {}> extends ICompositeAtom {
  isMapAtom: true,
  setProp<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): MapAtom<O>,
  prop<K: $Keys<O>>(key: K): $ElementType<O, K>,
  deleteProp<K: $Keys<O>>(key: K): MapAtom<O>,

  chnages: () => Tappable<MapAtomChangeType<O>>,
}

export default class MapAtom<O: {}> extends CompositeAtom implements IMapAtom<O> {
  isMapAtom = true
  _internalMap: O
  chnages: () => Tappable<MapAtomChangeType<O>>
  _changeEmitter: Emitter<MapAtomChangeType<O>>

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

  _change(o: $Shape<O>, propsNamesToDelete: Array<$Keys<O>>): this {
    const overriddenRefs = mapValues(o, (v, k) => {
      return this.prop(k)
    })

    propsNamesToDelete.forEach((propName) => {
      overriddenRefs[propName] = this.prop(propName)
    })

    forEach(overriddenRefs, (v, k) => {
      if (v) {
        this._unadopt(k, v)
      }
    })

    propsNamesToDelete.forEach((key) => {
      delete this._internalMap[key]
    })

    forEach((o: O), (v, k) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit({overriddenRefs: o, deletedKeys: propsNamesToDelete})
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'MapChange', overriddenRefs: o, deletedKeys: propsNamesToDelete})
    }

    if (this._deepDiffEmitter.hasTappers()) {
      this._deepDiffEmitter.emit({
        address: [],
        type: 'MapDiff',
        deepUnboxOfNewRefs: mapValues(o, (v) => v ? v.unboxDeep() : v),
        deepUnboxOfOldRefs: mapValues(overriddenRefs, (v) => v ? v.unboxDeep() : v),
        deletedKeys: propsNamesToDelete,
      })
    }

    return this
  }

  setProp<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V & IAtom): this {
    return this.assign({[key]: value})
  }

  prop<K: $Keys<O>>(key: K): $ElementType<O, K> {
    return (this._internalMap[key]: $IntentionalAny)
  }

  deleteProp<K: $Keys<O>>(key: K): this {
    return this._change({}, [key])
  }

  pointerTo(key: $Keys<O>) {
    return this.pointer().prop(key)
  }
}

