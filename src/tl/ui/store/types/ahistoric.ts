import * as t from '$shared/ioTypes'

const $InternalTimelineState = t.type({
  rangeShownInPanel: t.type({
    from: t.number,
    to: t.number,
  })
})

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
  internalTimelines: t.record(t.string, $InternalTimelineState)
})


export type UIAhistoricState = t.StaticTypeOf<typeof $UIAhistoricState>

