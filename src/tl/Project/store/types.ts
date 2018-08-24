import * as t from '$shared/ioTypes'
import {$StateWithHistory} from '$shared/utils/redux/withHistory/withHistory'

/**
 * Ahistoric state is persisted, but its changes
 * are not undoable.
 */
export const $ProjectAhistoricState = t.type({})

export type ProjectAhistoricState = t.StaticTypeOf<
  typeof $ProjectAhistoricState
>

/**
 * Ephemeral state is neither persisted nor undoable
 */
export const $ProjectEphemeralState = t.type({})

export type ProjectEphemeralState = t.StaticTypeOf<
  typeof $ProjectEphemeralState
>

// const $PrimitiveValue = t.type(
//   {type: t.literal('PrimitiveValue'), stringRepresentation: t.string},
//   'PrimitiveValue',
// )

const $StaticValueContainer = t.type({
  type: t.literal('StaticValueContainer'),
  value: t.union([t.number, t.string]),
})

export type StaticValueContainer = t.StaticTypeOf<typeof $StaticValueContainer>

const $INumberBetween0And1 = t.number.refinement(
  v => v >= 0 && v <= 1,
  'NumberBetween0And1',
)

const $ITimelinePointInterpolationDescriptor = t.type(
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

const $ITimelineVarPoint = <V>(valueType: t.Type<V>) =>
  t.type(
    {
      time: t.number,
      value: valueType,
      interpolationDescriptor: t.deferred(
        () => $ITimelinePointInterpolationDescriptor,
      ),
    },
    'TimelineVarPoint',
  )

export type ITimelineVarPoint = t.StaticTypeOf<typeof $ITimelineVarPoint>

const $BezierCurvesOfScalarValues = t.type({
  type: t.literal('BezierCurvesOfScalarValues'),
  points: t.array($ITimelineVarPoint(t.number)),
})

export type IBezierCurvesOfScalarValues = t.StaticTypeOf<
  typeof $BezierCurvesOfScalarValues
>

const $PropValueContainer = t.taggedUnion('type', [
  $StaticValueContainer,
  $BezierCurvesOfScalarValues,
])

const $ObjectPropState = t.type(
  {
    valueContainer: $PropValueContainer,
  },
  'ObjectPropState',
)

const $InternalObjectState = t.type(
  {
    props: t.record(t.string, $ObjectPropState),
  },
  'InternalObjectState',
)

const $InternalTimelineState = t.type(
  {
    objects: t.record(t.string, $InternalObjectState),
  },
  'InternalTimelineState',
)

/**
 * Historic state is both persisted and is undoable
 */
export const $ProjectHistoricState = t.type({
  internalTimeines: t.record(t.string, $InternalTimelineState),
})

export type ProjectHistoricState = t.StaticTypeOf<typeof $ProjectHistoricState>

export const $ProjectState = t.type({
  historic: $StateWithHistory($ProjectHistoricState),
  ahistoric: $ProjectAhistoricState,
  ephemeral: $ProjectEphemeralState,
})

export type ProjectState = t.StaticTypeOf<typeof $ProjectState>
