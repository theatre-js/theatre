// @flow

// export interface BaseReference {
//   isReference: true,
//   _setParent(parent: BaseReference): void,
// }

// export interface CompositeReference extends BaseReference {

// }

export type Diff = {
  oldValue: mixed,
  newValue: mixed,
  address: Array<string | number>,
}