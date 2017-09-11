// @flow
import {default as AbstractCompositeReference, type IAbstractCompositeReference} from './utils/AbstractCompositeReference'
import {forEach} from 'lodash'
import {type IAbstractReference} from './utils/AbstractReference'

type Key = string | number

export interface IMapOfReferences<O: {}> extends IAbstractCompositeReference, IAbstractReference {
  isMapOfReferences: true,
  set<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): MapOfReferences<O>,
  get<K: $Keys<O>>(key: K): $ElementType<O, K>,
}

export default class MapOfReferences<O: {}> extends AbstractCompositeReference implements IMapOfReferences<O> {
  isMapOfReferences = true
  _internalMap: O

  constructor(o: O & {[key: Key]: IAbstractReference}) {
    super()
    this._internalMap = ({}: $IntentionalAny)

    forEach(o, (value: IAbstractReference, key: Key) => {
      this._setWithoutInvokingEvents(key, value)
    })
  }

  _setWithoutInvokingEvents(key: Key, value: IAbstractReference) {
    this._internalMap[key] = value
    this._adopt(key, value)
  }

  unboxDeep(): $FixMe {
    const unboxedObject = {}
    forEach(this._internalMap, (value, key) => {
      if (value !== undefined) {
        unboxedObject[key] = value.unboxDeep()
      }
    })

    return unboxedObject
  }

  set<K: $Keys<O>, V: $ElementType<O, K>>(key: K, value: V): MapOfReferences<O>{
    const oldReference = this.get(key)
    const oldValue = oldReference ? oldReference.unboxDeep() : undefined
    const newValue = value.unboxDeep()
    const address = [key]

    this._setWithoutInvokingEvents(key, value)

    this._reportChange({address, oldValue, newValue})

    return this
  }

  get<K: $Keys<O>>(key: K): $ElementType<O, K> {
    return (this._internalMap[key]: $IntentionalAny)
  }
}