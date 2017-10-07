// @flow
import type {ComponentID} from './index'

export type DeclarativeComponentDescriptor = {|
  id: ComponentID,
  type: 'Declarative',
  localHiddenValuesByID: {[localID: string]: ValueDescriptor},
  whatToRender: WhatToRender,
  ruleSetsByID: {[id: string]: RuleSet}, // later
  listOfRulesets: Array<string>,
|}

export type WhatToRender = ReferenceToLocalHiddenValue | ReferenceToProp

export type RuleSet = {|
  selector: string, // better to have a more structured type for this
  modifiersByKey: {[key: string]: ModifierInstantiationValueDescriptor},
  listOfModifiers: Array<string>,
|}

type ModifierInstantiationValueDescriptor = {|
  type: 'ModifierInstantiationValueDescriptor',
  modifierID: string,
  props: MapDescriptor,
|}

export type ModifierDescriptor = {|
  modifierID: string,
|}

export type ReferenceToLocalHiddenValue = {|
  type: 'ReferenceToLocalHiddenValue',
  which: string,
|}

export type ReferenceToProp = {|
  type: 'ReferenceToProp',
  propID: string,
|}

export type MapDescriptor = {|type: 'MapDescriptor', values: {[key: string | number]: ValueDescriptor}|}
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
  type: 'ComponentInstantiationValueDescriptor',
  componentID: ComponentID,
  props: MapDescriptor,
  modifierInstantiationDescriptorsByID: MapDescriptor,
  listOfModifierInstantiationDescriptorIDs: ArrayDescriptor,
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