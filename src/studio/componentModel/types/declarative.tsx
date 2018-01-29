// @flow
import * as React from 'react'
import {ComponentId} from './index'

export interface IDeclarativeComponentDescriptor {
  __descriptorType: 'DeclarativeComponentDescriptor'
  id: ComponentId // this is unique
  displayName: string // this doesn't have to be
  type: 'Declarative'
  localHiddenValuesById: {[localid: string]: ValueDescriptor}
  whatToRender: WhatToRender
  ruleSetsById: {[id: string]: IRuleSet} // later
  listOfRulesets: Array<string>
  timelineDescriptors: {
    byId: {[id: string]: ITimelineDescriptor}
    list: Array<string>
  }
  props: {
    byId: {[id: string]: IPropDescriptor}
    list: Array<string>
  }
}

export type WhatToRender = IReferenceToLocalHiddenValue | IReferenceToProp

export interface IPropDescriptor {
  // each prop has a uniquely generated ID
  id: string
  // names are for humans. they'll be unique per component, but that's only because of humans. the code doesn't need the props to be unqiue.
  name: string
  // if component 'A' has a prop 'foo' and 'foo' is customizable, then any component can do this: <A foo="my custom value for foo" />`
  customizable: boolean
  // each prop MUST have a default value
  value: $FixMe
  // the spec of the prop
  spec: $FixMe
}

export interface IRuleSet {
  selector: string // better to have a more structured type for this
}

export interface IModifierInstantiationValueDescriptor {
  __descriptorType: 'ModifierInstantiationValueDescriptor'
  modifierId: string
  props: IMapDescriptor
  enabled: boolean
}

export interface IModifierDescriptor {
  id: string
  getClass: $FixMe
  InspectorComponent?: React.Component<$FixMe>
}

export interface IReferenceToLocalHiddenValue {
  __descriptorType: 'ReferenceToLocalHiddenValue'
  which: string
}

export interface IReferenceToProp {
  __descriptorType: 'ReferenceToProp'
  propid: string
}

export interface IMapDescriptor {
  [key: string]: $FixMe
}
export type ArrayDescriptor = Array<$FixMe>
export type StringLiteralDescriptor = string
export type NumberLiteralDescriptor = number
export type BooleanLiteralDescriptor = boolean

/**
 * This is how you'd tell a declarative component to construct another component.
 *
 * How is this different from a ComponentInstantiationDescriptor, you ask?
 * A ComponentInstantiationDescriptor is the value that `Elementify` receives .
 * and is already constructed, while ComponentInstantiationValueDescriptor must
 * be constructed first.
 */
export interface IComponentInstantiationValueDescriptor {
  __descriptorType: 'ComponentInstantiationValueDescriptor'
  componentId: ComponentId
  props: IMapDescriptor
  modifierInstantiationDescriptors: IModifierInstantiationValueDescriptors
}

export interface IModifierInstantiationValueDescriptors {
  list: ArrayDescriptor
  byId: IMapDescriptor
}

export type ValueDescriptorDescribedInAnObject =
  | IMapDescriptor
  | IReferenceToLocalHiddenValue
  | IReferenceToProp
  | IComponentInstantiationValueDescriptor
  | IModifierInstantiationValueDescriptor

export type ValueDescriptor =
  | ValueDescriptorDescribedInAnObject
  | StringLiteralDescriptor
  | BooleanLiteralDescriptor
  | ArrayDescriptor

export interface ITimelineDescriptor {
  __descriptorType: 'TimelineDescriptor'
  id: string
  vars: {[varId: string]: ITimelineVarDescriptor}
}

export interface IPointerThroughLocalHiddenValue {
  type: 'PointerThroughLocalHiddenValue'
  localHiddenValueId: string
  rest: Array<string>
}

export interface ITimelineVarDescriptor {
  __descriptorType: 'TimelineVarDescriptor'
  id: string
  backPointer: IPointerThroughLocalHiddenValue
  points: {
    firstId: undefined | null | string
    lastId: undefined | null | string
    // list: Array<string>,
    byId: {[id: string]: ITimelineVarPoint}
  }
}

export interface ITimelinePointInterpolationDescriptor {
  __descriptorType: 'TimelinePointInterpolationDescriptor'
  interpolationType: 'CubicBezier'
  lx: number
  ly: number
  rx: number
  ry: number
  connected: boolean
}

export interface ITimelineVarPoint {
  __descriptorType: 'TimelineVarPoint'
  id: string
  time: number
  value: number
  interpolationDescriptor: ITimelinePointInterpolationDescriptor
  prevId: string // 'head' means we're the first point
  nextId: string // 'end' means we're the last point
}
