// @flow
import AbstractCompositeReference from './utils/AbstractCompositeReference'
import {forEach} from 'lodash'
import AbstractReference from './utils/AbstractReference'

export default class ArrayOfReferences<V: AbstractReference> extends AbstractCompositeReference {
  _internalArray: Array<$FixMe>

  constructor(a: Array<V>) {
    super()
    this._internalArray = []

    forEach(a, (value: V) => {
      this._pushWithoutInvokingEvents(value)
    })
  }

  _pushWithoutInvokingEvents(value: V) {
    this._internalArray.push(value)
    this._adopt(this._internalArray.length - 1, value)
  }

  _setWithoutInvokingEvents(index: number, value: V) {
    this._internalArray[index] = value
    this._adopt(index, value)
  }

  unboxDeep(): $FixMe {
    return this._internalArray.map((value) => {
      if (value !== undefined) {
        return value.unboxDeep()
      }
    })
  }

  set(key: number, value: V) {
    const oldReference = this.get(key)
    const oldValue = oldReference ? oldReference.unboxDeep() : undefined
    const newValue = value.unboxDeep()
    const address = [key]

    this._setWithoutInvokingEvents(key, value)

    this._reportChange({address, oldValue, newValue})

    return this
  }

  get(index: number): V {
    return this._internalArray[index]
  }
}