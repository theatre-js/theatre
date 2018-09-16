import * as t from '$shared/ioTypes'
import {$StateWithHistory} from '$shared/utils/redux/withHistory/types'
import {$UIAhistoricState} from './ahistoric'
import {$UIEphemeralState} from './ephemeral'
import {$UIHistoricState} from './historic'
export * from './historic'
export * from './ahistoric'
export * from './ephemeral'

export const $UIState = t.type({
  historic: $StateWithHistory($UIHistoricState),
  ahistoric: $UIAhistoricState,
  ephemeral: $UIEphemeralState,
})

export type UIState = t.StaticTypeOf<typeof $UIState>
