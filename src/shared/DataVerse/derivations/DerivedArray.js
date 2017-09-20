
// @flow
import {type IReactiveArray} from '../types'

export interface IDerivedArray<T> extends IReactiveArray<T> {

}

export default class DerivedArray<T> implements IDerivedArray<T> {
  constructor() {

  }

  concat(stuff: Array<T>): DerivedArray<T> {
    return (null: $FixMe)
  }
}