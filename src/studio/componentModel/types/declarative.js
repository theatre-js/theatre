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
  modifiersByKey: {[key: string]: ModifierInstantiationDescriptor},
  listOfModifiers: Array<string>,
|}

type ModifierInstantiationDescriptor = {|
  modifierID: string,
  props: {[key: string]: $FixMe},
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
export type ArrayDescriptor = {|type: 'ArrayDescriptor', values: Array<ValueDescriptor>|}
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
|}

export type ValueDescriptorDescribedInAnObject =
  | ComponentInstantiationValueDescriptor
  | MapDescriptor
  | ReferenceToLocalHiddenValue
  | ReferenceToProp
  | ArrayDescriptor


export type ValueDescriptor =
  | ValueDescriptorDescribedInAnObject
  | StringLiteralDescriptor
  | BooleanLiteralDescriptor