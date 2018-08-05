import * as t from '$shared/ioTypes'
import {$StateWithHistory} from '$shared/utils/redux/withHistory/withHistory'

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

/**
 * Historic state is both persisted and is undoable
 */
export const $UIHistoricState = $StateWithHistory(
  t.type({
    foo: t.string,
    allInOnePanel: t.type({
      height: t.number,
      selectedProject: t.union([t.null, t.string]),
      selectedTimelineByProject: t.record(t.string, t.string),
      selectedTimelineInstanceByProjectAndTimeline: t.record(t.string, t.string),
      leftWidth: t.number,
    }),
  }),
)

export type UIHistoricState = t.StaticTypeOf<typeof $UIHistoricState>

export const $UIState = t.type({
  historic: $UIHistoricState,
  ahistoric: $UIAhistoricState,
  ephemeral: $UIEphemeralState,
})

export type UIState = t.StaticTypeOf<typeof $UIState>
