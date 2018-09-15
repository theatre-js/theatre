import * as t from '$shared/ioTypes'
import {$StateWithHistory} from '$shared/utils/redux/withHistory/types'

/**
 * Ahistoric state is persisted, but its changes
 * are not undoable.
 */
export const $UIAhistoricState = t.type({
  visibilityState: t.union([
    t.literal('everythingIsHidden'),
    t.literal('everythingIsVisible'),
    t.literal('onlyTriggerIsVisible'),
  ]),
  theTrigger: t.type({
    position: t.type({
      closestCorner: t.union([
        t.literal('topLeft'),
        t.literal('topRight'),
        t.literal('bottomLeft'),
        t.literal('bottomRight'),
      ]),
      distanceFromHorizontalEdge: t.number,
      distanceFromVerticalEdge: t.number,
    }),
  }),
})

export type UIAhistoricState = t.StaticTypeOf<typeof $UIAhistoricState>

/**
 * Ephemeral state is neither persisted nor undoable
 */
export const $UIEphemeralState = t.type({
  initialised: t.boolean,
})

export type UIEphemeralState = t.StaticTypeOf<typeof $UIEphemeralState>

const $PropState = t.type({
  expanded: t.boolean,
  heightWhenExpanded: t.number,
})

const $ObjectState = t.type(
  {
    activePropsList: t.array(t.string),
    props: t.record(t.string, $PropState),
  },
  'ObjectStateInUI',
)

const $TimelineState = t.type({
  selectedTimelineInstance: t.union([t.null, t.string]),
  objects: t.record(t.string, $ObjectState),
  collapsedNodesByPath: t.record(t.string, t.literal(1)),
})

const $ProjectState = t.type(
  {
    selectedTimeline: t.union([t.null, t.string]),
    timelines: t.record(t.string, $TimelineState),
  },
  'UIProjectState',
)

/**
 * Historic state is both persisted and is undoable
 */
export const $UIHistoricState = t.type({
  foo: t.string,
  allInOnePanel: t.type({
    // height: t.number,
    selectedProject: t.union([t.null, t.string]),
    projects: t.record(t.string, $ProjectState),
    leftWidthFraction: t.number,
    margins: t.type({
      left: t.number,
      top: t.number,
      right: t.number,
      bottom: t.number,
    }),
  }),
})

export type UIHistoricState = t.StaticTypeOf<typeof $UIHistoricState>

export const $UIState = t.type({
  historic: $StateWithHistory($UIHistoricState),
  ahistoric: $UIAhistoricState,
  ephemeral: $UIEphemeralState,
})

export type UIState = t.StaticTypeOf<typeof $UIState>
