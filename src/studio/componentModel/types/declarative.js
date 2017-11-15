// @flow
import * as React from 'react'
import type {ComponentId} from './index'

export type DeclarativeComponentDescriptor = {|
  id: ComponentId,
  type: 'Declarative',
  localHiddenValuesById: {[localid: string]: ValueDescriptor},
  whatToRender: WhatToRender,
  ruleSetsById: {[id: string]: RuleSet}, // later
  listOfRulesets: Array<string>,
  timelineDescriptors: {
    byId: {[id: string]: TimelineDescriptor},
    list: Array<string>,
  },
|}

export type WhatToRender = ReferenceToLocalHiddenValue | ReferenceToProp

export type RuleSet = {|
  selector: string, // better to have a more structured type for this
|}

export type ModifierInstantiationValueDescriptor = {|
  __descriptorType: 'ModifierInstantiationValueDescriptor',
  modifierId: string,
  props: MapDescriptor,
  enabled: boolean,
|}

export type ModifierDescriptor = {|
  id: string,
  modifyPrototypalDict: $FixMe,
  InspectorComponent?: React.Component<$FixMe>,
|}

export type ReferenceToLocalHiddenValue = {|
  __descriptorType: 'ReferenceToLocalHiddenValue',
  which: string,
|}

export type ReferenceToProp = {|
  __descriptorType: 'ReferenceToProp',
  propid: string,
|}

export type MapDescriptor = {[key: string | number]: $FixMe}
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
export type ComponentInstantiationValueDescriptor = {|
  __descriptorType: 'ComponentInstantiationValueDescriptor',
  componentId: ComponentId,
  props: MapDescriptor,
  modifierInstantiationDescriptors: ModifierInstantiationValueDescriptors,
|}

export type ModifierInstantiationValueDescriptors = {|
  list: ArrayDescriptor,
  byId: MapDescriptor,
|}

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

export type TimelineDescriptor = {|
  __descriptorType: 'TimelineDescriptor',
  id: string,
  vars: {[varId: string]: TimelineVarDescriptor},
|}

export type PointerThroughLocalHiddenValue = {|
  type: 'PointerThroughLocalHiddenValue',
  localHiddenValueId: string,
  rest: Array<string>,
|}

export type TimelineVarDescriptor = {|
  __descriptorType: 'TimelineVarDescriptor',
  id: string,
  backPointer: PointerThroughLocalHiddenValue,
  points: {
    // list: Array<string>,
    byId: {[id: string]: TimelineVarPoint},
  },
|}

export type TimelinePointInterpolator = {|
  type: 'QubicBezier',
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  connected: boolean,
|}

export type TimelineVarPoint = {|
  __descriptorType: 'TimelineVarPoint',
  time: number,
  value: number,
  interpolator: TimelinePointInterpolator,
|}
