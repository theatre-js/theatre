// @flow
import {type IContainer} from './container'

export interface IBasePointer<T> {
  bs: true,
  getValue(): T,
}

export interface IObjectPointer<O: {}> extends IBasePointer<O> {
  o: true,
}

export interface IBoxedPointer<T> extends IBasePointer<T> {
  b: true,
}

// type Decide = (
//   | <T: string>(T) => IBoxedPointer<T>
//   | <T: number>(T) => IBoxedPointer<T>
//   | <T: boolean>(T) => IBoxedPointer<T>
//   | <T: void>(T) => IBoxedPointer<T>
//   | <T: null>(T) => IBoxedPointer<T>
//   | <O: {}>(O) => IObjectPointer<O>
// )

type PropFn = (
  & <O: {}, C: IBasePointer<O>, K: $Keys<O>>(C, K) => IBasePointer<$ElementType<O, K>>
  & <O: void, C: IBasePointer<O>>(C, K) => IBasePointer<void>
  // & <O: {}, C: IObjectPointer<O>, K: $Keys<O>, V: $ElementType<O, K>, V: string>(C, K) => IBoxedPointer<V>
)

export const prop: PropFn = (container) => {
  return (null: $FixMe)
}