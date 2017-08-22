// @flow

export type ComponentID = string

export type ComponentInstantiationDescriptor = {
  componentID: ComponentID,
  props: {[key: string]: mixed},
}