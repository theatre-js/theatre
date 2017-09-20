
// @flow
import {type IReactiveMap} from '../types'
// import Derivation from './Derivation'
import Tappable from '../utils/Tappable'
import type {MapAtomChangeType} from '$shared/DataVerse'

export interface IDerivedMap<O: {}> extends IReactiveMap<O> {

}

type Key = string | number

// type Constructors<O: {}> = $ObjMap<O, (m: DerivedMap<O>) => >

export default class DerivedMap<O: {}> implements IDerivedMap<O> {
  _constructors: $FixMe
  _delegationMap: ?DerivedMap<{}>
  _wires: Map<Key, $FixMe>

  constructor(constructors: $FixMe, delegationMap?: DerivedMap<$FixMe>) {
    this._constructors = constructors
    this._delegationMap = delegationMap
    this._wires = new Map()
  }

  extend<OO: {}>(oo: OO): DerivedMap<{...O, ...OO}> {
    return new DerivedMap(oo, this)
  }

  prop(key: Key) {
    if (this._wires.has(key)) {
      // $FixMe
      return this._wires.get(key).get()
    } else if (this._constructors[key]) {
      return this._getUnboxed(key)
    } else if (this._delegationMap) {
      return this._delegationMap._getDelegated(key, this)
    }
  }

  _getUnboxed(key: Key) {
    return this._constructors[key]()
  }

  _getDelegated(key: Key, frontMap: DerivedMap<any>) {

  }

  delegateTo(target: $FixMe) {

  }

  changes(): Tappable<MapAtomChangeType<O>> {
    return (null: $FixMe)
  }
}