import {$IComponentId} from './'
import React from 'react'
import {IComponentId} from './index'
import * as t from '$shared/ioTypes'
import {difference, findLast} from 'lodash'
import {listAndById} from '$shared/types'

// export interface IDeclarativeComponentDescriptor {
//   __descriptorType: 'DeclarativeComponentDescriptor'
//   id: IComponentId // this is unique
//   displayName: string // this doesn't have to be
//   localHiddenValuesById: {[localid: string]: ValueDescriptor}
//   whatToRender: WhatToRender
//   timelineDescriptors: {
//     byId: {[id: string]: ITimelineDescriptor}
//     list: Array<string>
//   }
//   meta?: {
//     composePanel?: {
//       selectedNodeId?: string
//     }
//   }
//   isScene: boolean
// }

export const $IDeclarativeComponentDescriptor = t.type(
  {
    __descriptorType: t.literal('DeclarativeComponentDescriptor'),
    id: t.deferred(() => $IComponentId),
    displayName: t.string,
    localHiddenValuesById: t.deferred(() => $ILocalHiddenValuesById),
    whatToRender: t.deferred(() => $IReferenceToLocalHiddenValue),
    isScene: t.optional(t.boolean),
    timelineDescriptors: t.deferred(() => $ITimelineDescriptors),
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
  props: Record<string, mixed>
  enabled: boolean
}

export interface IModifierDescriptor {
  id: string
  getClass: $FixMe
  InspectorComponent?: React.Component<$FixMe>
}

// export interface IReferenceToLocalHiddenValue {
//   __descriptorType: 'ReferenceToLocalHiddenValue'
//   which: string
// }

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
  .withInvariant((v, c) => {
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

export interface IReferenceToProp {
  __descriptorType: 'ReferenceToProp'
  propid: string
}

// export type IMapDescriptor<O> = Record<string, O>

// export type IArrayDescriptor<T> = Array<T>

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
  componentId: IComponentId
  props?: Record<string, $FixMe>
  modifierInstantiationDescriptors?: IModifierInstantiationValueDescriptors
}

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
// export type IComponentInstantiationValueDescriptor = t.TypeOf<typeof $IComponentInstantiationValueDescriptor>

// export interface IModifierInstantiationValueDescriptors {
//   list: string[]
//   byId: Record<string, IModifierInstantiationValueDescriptor>
// }

export const $IModifierInstantiationValueDescriptors = listAndById(
  t.fixMe,
  'IModifierInstantiationValueDescriptors',
)

export type IModifierInstantiationValueDescriptors = t.StaticTypeOf<
  typeof $IModifierInstantiationValueDescriptors
>

export type ITaggedValueDescriptor =
  | IReferenceToLocalHiddenValue
  | IReferenceToProp
  | IComponentInstantiationValueDescriptor
  | IModifierInstantiationValueDescriptor

export const $ITaggedValueDescriptor = t.taggedUnion(
  '__descriptorType',
  [$IReferenceToLocalHiddenValue, $IComponentInstantiationValueDescriptor],
  'ITaggedValueDescriptor',
)
// export type ITaggedValueDescriptor = t.TypeOf<typeof $ITaggedValueDescriptor>

export type ValueDescriptor =
  | ITaggedValueDescriptor
  | string
  | boolean
  | number
  | null
  | undefined
  | Array<mixed>
  | Record<string, mixed> & {__descriptorType: never}

export const $IValueDescriptor = t.union(
  [
    t.string,
    t.number,
    t.boolean,
    t.null,
    t.undefined,
    $ITaggedValueDescriptor,
    t.array(t.$IntentionalAny),
    t.type({__descriptorType: t.never}, 'IMapDescriptor'),
  ],
  'IValueDescriptor',
)
export type IValueDescriptor = t.StaticTypeOf<typeof $IValueDescriptor>

// export interface ITimelineDescriptor {
//   __descriptorType: 'TimelineDescriptor'
//   id: string
//   vars: {[varId: string]: ITimelineVarDescriptor}
// }

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

export const $ITimelineVarDescriptor = t.type(
  {
    __descriptorType: t.literal('TimelineVarDescriptor'),
    id: t.string,
    // backPointer: IPointerThroughLocalHiddenValue
    points: t.type({
      firstId: t.union([t.null, t.string]),
      lastId: t.union([t.null, t.string]),
      byId: t.record(t.string, t.deferred(() => {return $ITimelineVarPoint})),
    }),
  },
  'TimelineVarDescriptor',
)
export type ITimelineVarDescriptor = t.StaticTypeOf<
  typeof $ITimelineVarDescriptor
>

// export interface ITimelineVarDescriptor {
//   __descriptorType: 'TimelineVarDescriptor'
//   id: string
//   backPointer: IPointerThroughLocalHiddenValue
//   points: {
//     firstId: undefined | null | string
//     lastId: undefined | null | string
//     // list: Array<string>,
//     byId: {[id: string]: ITimelineVarPoint}
//   }
// }

// export interface ITimelinePointInterpolationDescriptor {
//   __descriptorType: 'TimelinePointInterpolationDescriptor'
//   interpolationType: 'CubicBezier'
//   // handles: [lx, ly, rx, ry]
//   handles: [number, number, number, number]
//   connected: boolean
// }

export const $ITimelinePointInterpolationDescriptor = t.type(
  {
    __descriptorType: t.literal('TimelinePointInterpolationDescriptor'),
    interpolationType: t.literal('CubicBezier'),
    handles: t.tuple([t.number, t.number, t.number, t.number]),
    connected: t.boolean,
  },
  'TimelinePointInterpolationDescriptor',
).withInvariant((v) => {
  const errors: string[] = []
  const leftHandle = v.handles[0]
  if (leftHandle < 0 || leftHandle > 1) {
    errors.push(`Handle 0 should be between 0 <= x <= 1. It's actually ${leftHandle}`)
  }

  const rightHandle = v.handles[2]
  if (rightHandle < 0 || rightHandle > 1) {
    errors.push(`Handle 2 should be between 0 <= x <= 1. It's actually ${rightHandle}`)
  }
  return errors.length > 0 ? errors : true
})
export type ITimelinePointInterpolationDescriptor = t.StaticTypeOf<
  typeof $ITimelinePointInterpolationDescriptor
>

// export interface ITimelineVarPoint {
//   __descriptorType: 'TimelineVarPoint'
//   id: string
//   time: number
//   value: number
//   interpolationDescriptor: ITimelinePointInterpolationDescriptor
//   prevId: string // 'head' means we're the first point
//   nextId: string // 'end' means we're the last point
// }

export const $ITimelineVarPoint = t.type(
  {
    __descriptorType: t.literal('TimelineVarPoint'),
    id: t.string,
    time: t.number,
    value: t.number,
    interpolationDescriptor: t.deferred(
      () => $ITimelinePointInterpolationDescriptor,
    ),
    prevId: t.string, // 'head' means we're the first point
    nextId: t.string, // 'end' means we're the last point
  },
  'TimelineVarPoint',
)
export type ITimelineVarPoint = t.StaticTypeOf<typeof $ITimelineVarPoint>
