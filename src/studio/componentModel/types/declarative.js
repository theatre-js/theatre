// @flow
import type {ComponentId} from './index'

export type DeclarativeComponentDescriptor = {|
  id: ComponentId,
  type: 'Declarative',
  localHiddenValuesById: {[localid: string]: ValueDescriptor},
  whatToRender: WhatToRender,
  ruleSetsById: {[id: string]: RuleSet}, // later
  listOfRulesets: Array<string>,
|}

export type WhatToRender = ReferenceToLocalHiddenValue | ReferenceToProp

export type RuleSet = {|
  selector: string, // better to have a more structured type for this
|}

type ModifierInstantiationValueDescriptor = {|
  __descriptorType: 'ModifierInstantiationValueDescriptor',
  modifierId: string,
  props: MapDescriptor,
  enabled: boolean,
|}

export type ModifierDescriptor = {|
  id: string,
  modifyPrototypalDict: $FixMe,
|}

export type ReferenceToLocalHiddenValue = {|
  __descriptorType: 'ReferenceToLocalHiddenValue',
  which: string,
|}

export type ReferenceToProp = {|
  __descriptorType: 'ReferenceToProp',
  propid: string,
|}

export type MapDescriptor = {|...{__descriptorType: 'MapDescriptor'}, ...{|[key: string | number]: ValueDescriptor|}|}
export type ArrayDescriptor = Array<ValueDescriptor>
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
  modifierInstantiationDescriptors: {
    list: ArrayDescriptor,
    byId: MapDescriptor,
  },
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