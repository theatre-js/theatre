import * as t from '$shared/ioTypes'
export const $UIEphemeralState = t.type({
  initialised: t.boolean,
})
export type UIEphemeralState = t.StaticTypeOf<typeof $UIEphemeralState>
