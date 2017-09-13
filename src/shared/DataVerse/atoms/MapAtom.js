// @flow
import {default as CompositeAtom, type ICompositeAtom} from './utils/CompositeAtom'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import type {IAtom} from './utils/Atom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {AddressedChangeset} from '$shared/DataVerse/types'

type Unboxed<O> = $FixMe // eslint-disable-line no-unused-vars

export type ChangeType<O> = $Shape<O>
export type DeepChangeType<O> = AddressedChangeset & {type: 'MapChange', overriddenRefs: ChangeType<O>}
export type DeepDiffType<O> = AddressedChangeset & {type: 'MapDiff', deepUnboxOfOldRefs: Unboxed<O>, deepUnboxOfNewRefs: Unboxed<O>}

export interface IMapAtom<O: {}> extends ICompositeAtom {
  isMapAtom: true,
  set<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): MapAtom<O>,
  get<K: $Keys<O>>(key: K): $ElementType<O, K>,

  chnages: () => Tappable<ChangeType<O>>,
}

export default class MapAtom<O: {}> extends CompositeAtom implements IMapAtom<O> {
  isMapAtom = true
  _internalMap: O
  chnages: () => Tappable<ChangeType<O>>
  _changeEmitter: Emitter<ChangeType<O>>

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

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(o)
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'MapChange', overriddenRefs: o})
    }

    if (this._deepDiffEmitter.hasTappers()) {
      this._deepDiffEmitter.emit({
        address: [],
        type: 'MapDiff',
        deepUnboxOfNewRefs: mapValues(o, (v) => v ? v.unboxDeep() : v),
        deepUnboxOfOldRefs: mapValues(overriddenRefs, (v) => v ? v.unboxDeep() : v),
      })
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