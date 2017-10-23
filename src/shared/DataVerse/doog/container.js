// @flow
import type {IObjectPointer} from './pointers'

export interface IContainer<O: {}> {
  _state: O,
  pointer(): IObjectPointer<O>,
}

class DoogContainer<O: {}> implements IContainer<O> {
  _state: O
  // pointer: () => IObjectPointer<O>
  constructor(initialState: O): IContainer<O> {
    this._state = initialState
    return this
  }
  pointer(): IObjectPointer<O> {
    return (null: $FixMe)
  }
}

export default function container<O: {}>(initialState: O): IContainer<O> {
  return new DoogContainer(initialState)
}