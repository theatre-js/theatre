import * as t from '$shared/ioTypes'

/**
 * Ahistoric state is persisted, but its changes
 * are not undoable.
 */
export const $UIAhistoricState = t.type({
  uiHidden: t.boolean,
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
export const $UIEphemeralState = t.type({})

export type UIEphemeralState = t.StaticTypeOf<typeof $UIEphemeralState>

/**
 * Historic state is both persisted and is undoable
 */
export const $UIHistoricState = t.type({})
export type UIHistoricState = {}

export const $UIState = t.type({
  historic: $UIHistoricState,
  ahistoric: $UIAhistoricState,
  ephemeral: $UIEphemeralState,
})

export type UIState = t.StaticTypeOf<typeof $UIState>
