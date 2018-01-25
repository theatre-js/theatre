// @flow
import * as React from 'react'
import {ComponentId} from './index'

export type DeclarativeComponentDescriptor = {
  __descriptorType: 'DeclarativeComponentDescriptor',
  id: ComponentId, // this is unique
  displayName: string, // this doesn't have to be
  type: 'Declarative',
  localHiddenValuesById: {[localid: string]: ValueDescriptor},
  whatToRender: WhatToRender,
  ruleSetsById: {[id: string]: RuleSet}, // later
  listOfRulesets: Array<string>,
  timelineDescriptors: {
    byId: {[id: string]: TimelineDescriptor},
    list: Array<string>,
  },
  props: {
    byId: {[id: string]: PropDescriptor},
    list: Array<string>,
  },
}

export type WhatToRender = ReferenceToLocalHiddenValue | ReferenceToProp

export type PropDescriptor = {
  // each prop has a uniquely generated ID
  id: string,
  // names are for humans. they'll be unique per component, but that's only because of humans. the code doesn't need the props to be unqiue.
  name: string,
  // if component 'A' has a prop 'foo' and 'foo' is customizable, then any component can do this: <A foo="my custom value for foo" />`
  customizable: boolean,
  // each prop MUST have a default value
  value: $FixMe,
  // the spec of the prop
  spec: $FixMe,
}

export type RuleSet = {
  selector: string, // better to have a more structured type for this
}

export type ModifierInstantiationValueDescriptor = {
  __descriptorType: 'ModifierInstantiationValueDescriptor',
  modifierId: string,
  props: MapDescriptor,
  enabled: boolean,
}

export type ModifierDescriptor = {
  id: string,
  getClass: $FixMe,
  InspectorComponent?: React.Component<$FixMe>,
}

export type ReferenceToLocalHiddenValue = {
  __descriptorType: 'ReferenceToLocalHiddenValue',
  which: string,
}

export type ReferenceToProp = {
  __descriptorType: 'ReferenceToProp',
  propid: string,
}

export type MapDescriptor = {[key: string]: $FixMe}
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
export type ComponentInstantiationValueDescriptor = {
  __descriptorType: 'ComponentInstantiationValueDescriptor',
  componentId: ComponentId,
  props: MapDescriptor,
  modifierInstantiationDescriptors: ModifierInstantiationValueDescriptors,
}

export type ModifierInstantiationValueDescriptors = {
  list: ArrayDescriptor,
  byId: MapDescriptor,
}

export type ValueDescriptorDescribedInAnObject =
  | MapDescriptor
  | ReferenceToLocalHiddenValue
  | ReferenceToProp
  | ComponentInstantiationValueDescriptor
  | ModifierInstantiationValueDescriptor

export type ValueDescriptor =
  | ValueDescriptorDescribedInAnObject
  | StringLiteralDescriptor
  | BooleanLiteralDescriptor
  | ArrayDescriptor

export type TimelineDescriptor = {
  __descriptorType: 'TimelineDescriptor',
  id: string,
  vars: {[varId: string]: TimelineVarDescriptor},
}

export type PointerThroughLocalHiddenValue = {
  type: 'PointerThroughLocalHiddenValue',
  localHiddenValueId: string,
  rest: Array<string>,
}

export type TimelineVarDescriptor = {
  __descriptorType: 'TimelineVarDescriptor',
  id: string,
  backPointer: PointerThroughLocalHiddenValue,
  points: {
    firstId: undefined | null | string,
    lastId: undefined | null | string,
    // list: Array<string>,
    byId: {[id: string]: TimelineVarPoint},
  },
}

export type TimelinePointInterpolationDescriptor = {
  __descriptorType: 'TimelinePointInterpolationDescriptor',
  interpolationType: 'CubicBezier',
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  connected: boolean,
}

export type TimelineVarPoint = {
  __descriptorType: 'TimelineVarPoint',
  id: string,
  time: number,
  value: number,
  interpolationDescriptor: TimelinePointInterpolationDescriptor,
  prevId: string, // 'head' means we're the first point
  nextId: string, // 'end' means we're the last point
}
