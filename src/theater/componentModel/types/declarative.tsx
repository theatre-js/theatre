import {$IComponentId} from './'
import React from 'react'
import {IComponentId} from './index'
import * as t from '$shared/ioTypes'
import {findLast} from 'lodash'
import {listAndById} from '$shared/types'

export const $IDeclarativeComponentDescriptor = t.type(
  {
    __descriptorType: t.literal('DeclarativeComponentDescriptor'),
    id: t.deferred(() => $IComponentId),
    displayName: t.string,
    localHiddenValuesById: t.deferred(() => $ILocalHiddenValuesById),
    whatToRender: t.deferred(() => $IReferenceToLocalHiddenValue),
    isScene: t.optional(t.boolean),
    timelineDescriptors: t.deferred(() => $ITimelineDescriptors),
    meta: t.optional(
      t.type({
        composePanel: t.optional(
          t.type({
            selectedNodeId: t.optional(t.string),
          }),
        ),
      }),
    ),
  },
  'IDeclarativeComponentDescriptor',
)
export type IDeclarativeComponentDescriptor = t.StaticTypeOf<
  typeof $IDeclarativeComponentDescriptor
>

export const $ILocalHiddenValuesById = t.record(
  t.string,
  t.deferred(() => $IValueDescriptor),
)
export type ILocalHiddenValuesById = t.StaticTypeOf<
  typeof $ILocalHiddenValuesById
>

export type WhatToRender = IReferenceToLocalHiddenValue

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

export interface IModifierDescriptor {
  id: string
  getClass: $FixMe
  InspectorComponent?: React.Component<$FixMe>
}

// crawls up the validationContext to find the first IDeclarativeComponentDescriptor
const findDeclarativeComponentDescriptorInContext = (
  c: t.ValidationContext,
): undefined | IDeclarativeComponentDescriptor => {
  const possibleComponent:
    | undefined
    | IDeclarativeComponentDescriptor = findLast(
    c.map(({value}) => value),
    (value: $IntentionalAny) => {
      return (
        typeof value === 'object' &&
        value &&
        value.__descriptorType === 'DeclarativeComponentDescriptor'
      )
    },
  )

  return possibleComponent
}

export const $IReferenceToLocalHiddenValue = t
  .type(
    {
      __descriptorType: t.literal('ReferenceToLocalHiddenValue'),
      which: t.string,
    },
    'IReferenceToLocalHiddenValue',
  )
  .withRuntimeCheck((v, c) => {
    if (!c) return true
    const possibleComponent = findDeclarativeComponentDescriptorInContext(c)
    if (!possibleComponent) {
      return [
        'A ReferenceToLocalHiddenValue has been found outside a DeclarativeComponentDescriptor',
      ]
    }
    const {localHiddenValuesById} = possibleComponent
    if (
      !localHiddenValuesById ||
      !localHiddenValuesById.hasOwnProperty(v.which)
    ) {
      return [`LocalHiddenValue '${v.which}' was not found in the component`]
    }
    return true
  })

export type IReferenceToLocalHiddenValue = t.StaticTypeOf<
  typeof $IReferenceToLocalHiddenValue
>

export const $IComponentInstantiationValueDescriptor = t.type(
  {
    __descriptorType: t.literal('ComponentInstantiationValueDescriptor'),
    componentId: t.deferred(() => $IComponentId),
    props: t.record(t.string, t.fixMe),
    modifierInstantiationDescriptors: t.maybe(
      t.deferred(() => $IModifierInstantiationValueDescriptors),
    ),
  },
  'ComponentInstantiationValueDescriptor',
)
/**
 * This is how you'd tell a declarative component to construct another component.
 *
 * How is this different from a ComponentInstantiationDescriptor, you ask?
 * A ComponentInstantiationDescriptor is the value that `Elementify` receives .
 * and is already constructed, while ComponentInstantiationValueDescriptor must
 * be constructed first.
 */
export type IComponentInstantiationValueDescriptor = t.StaticTypeOf<
  typeof $IComponentInstantiationValueDescriptor
>

export const $IModifierInstantiationValueDescriptors = listAndById(
  t.deferred(() => $IModifierInstantiationValueDescriptor),
  'IModifierInstantiationValueDescriptors',
)

export type IModifierInstantiationValueDescriptors = t.StaticTypeOf<
  typeof $IModifierInstantiationValueDescriptors
>

export const $IModifierInstantiationValueDescriptor = t.type(
  {
    __descriptorType: t.literal('ModifierInstantiationValueDescriptor'),
    modifierId: t.string,
    props: t.record(t.string, t.fixMe),
    enabled: t.boolean,
  },
  'ModifierInstantiationValueDescriptor',
)
export type IModifierInstantiationValueDescriptor = t.StaticTypeOf<
  typeof $IModifierInstantiationValueDescriptor
>

export const $ITaggedValueDescriptor = t.taggedUnion(
  '__descriptorType',
  [
    $IReferenceToLocalHiddenValue,
    $IComponentInstantiationValueDescriptor,
    $IModifierInstantiationValueDescriptor,
  ],
  'ITaggedValueDescriptor',
)
export type ITaggedValueDescriptor = t.StaticTypeOf<
  typeof $ITaggedValueDescriptor
>

// export type ValueDescriptor =
//   | ITaggedValueDescriptor
//   | string
//   | boolean
//   | number
//   | null
//   | undefined
//   | Array<mixed>
//   | Record<string, mixed> & {__descriptorType: never}

export const $IMapDescriptor: t.Type<
{[K in string]: K extends '__descriptorType' ? never : IValueDescriptor}
> = t.record(
  t.string.refinement(v => v !== '__descriptorType'),
  t.deferred(() => $IValueDescriptor),
  'MapDescriptor',
) as $IntentionalAny
export type IMapDescriptor = t.StaticTypeOf<typeof $IMapDescriptor>

interface IArrayValueDescriptor extends Array<IValueDescriptor> {}

export type IValueDescriptor =
  | string
  | number
  | boolean
  | null
  | undefined
  | ITaggedValueDescriptor
  | IArrayValueDescriptor
  | IMapDescriptor

export const $IValueDescriptor = t.union(
  [
    t.string,
    t.number,
    t.boolean,
    t.null,
    t.undefined,
    $ITaggedValueDescriptor,
    t.array(t.$IntentionalAny),
    $IMapDescriptor,
  ],
  'IValueDescriptor',
).castStatic<IValueDescriptor>()

export const $ITimelineDescriptor = t.type(
  {
    __descriptorType: t.literal('TimelineDescriptor'),
    id: t.string,
    variables: t.record(t.string, t.deferred(() => $ITimelineVarDescriptor)),
  },
  'TimelineDescriptor',
)
export type ITimelineDesccriptor = t.StaticTypeOf<typeof $ITimelineDescriptor>

const $ITimelineDescriptors = listAndById(
  $ITimelineDescriptor,
  'TimelineDescriptors',
)

export interface IPointerThroughLocalHiddenValue {
  type: 'PointerThroughLocalHiddenValue'
  localHiddenValueId: string
  rest: Array<string>
}

export const $ITimelineVarDescriptor = t
  .type(
    {
      __descriptorType: t.literal('TimelineVarDescriptor'),
      id: t.string,
      backPointer: t.fixMe, // IPointerThroughLocalHiddenValue
      /**
       * We should reconsider the data structure in which we store points, if things become slow.
       */
      points: t.array(t.deferred(() => $ITimelineVarPoint)),
      // @todo this is tmeporary. Use backPointer
      component: t.string,
      // @todo this is tmeporary. Use backPointer
      property: t.string,
      // @todo this is temporary. Extremums can be derived from the points
      // extremums: t.tuple([t.number, t.number]),
    },
    'TimelineVarDescriptor',
  )
  .withRuntimeCheck((v, c) => {
    if (!c) return true
    const lastPoint = v.points[v.points.length - 1]
    if (!lastPoint) return true
    if (lastPoint.interpolationDescriptor.connected === true) {
      return ['Last point can never be connected, but this one is']
    }
    return true
  })
export type ITimelineVarDescriptor = t.StaticTypeOf<
  typeof $ITimelineVarDescriptor
>

const $INumberBetween0And1 = t.number.refinement(
  v => v >= 0 && v <= 1,
  'NumberBetween0And1',
)

export const $ITimelinePointInterpolationDescriptor = t.type(
  {
    __descriptorType: t.literal('TimelinePointInterpolationDescriptor'),
    interpolationType: t.literal('CubicBezier'),
    handles: t.tuple([
      $INumberBetween0And1,
      t.number,
      $INumberBetween0And1,
      t.number,
    ]),
    connected: t.boolean,
  },
  'TimelinePointInterpolationDescriptor',
)
export type ITimelinePointInterpolationDescriptor = t.StaticTypeOf<
  typeof $ITimelinePointInterpolationDescriptor
>

export const $ITimelineVarPoint = t.type(
  {
    // @todo let's require a __descriptorType
    // __descriptorType: t.literal('TimelineVarPoint'),
    time: t.number,
    value: t.number,
    interpolationDescriptor: t.deferred(
      () => $ITimelinePointInterpolationDescriptor,
    ),
  },
  'TimelineVarPoint',
)
export type ITimelineVarPoint = t.StaticTypeOf<typeof $ITimelineVarPoint>
