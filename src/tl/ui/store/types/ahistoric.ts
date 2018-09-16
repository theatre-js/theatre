import * as t from '$shared/ioTypes'

const $PropState = t.type({})

const $ObjectState = t.type(
  {
    props: t.record(t.string, $PropState),
  },
  'ObjectStateInUI',
)

const $TimelineState = t.type({
  objects: t.record(t.string, $ObjectState),
  rangeShownInPanel: t.union([
    t.undefined,
    t.type({
      from: t.number,
      to: t.number,
    }),
  ]),
})

const $ProjectState = t.type(
  {
    timelines: t.record(t.string, $TimelineState),
  },
  'UIProjectState',
)

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

  allInOnePanel: t.type({
    projects: t.record(t.string, $ProjectState),
  }),
})

export type UIAhistoricState = t.StaticTypeOf<typeof $UIAhistoricState>
