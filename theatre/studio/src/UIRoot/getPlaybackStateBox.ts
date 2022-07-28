import type {IDerivation} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import type {IPlaybackRange} from '@theatre/core/sequences/Sequence'
import type Sequence from '@theatre/core/sequences/Sequence'
import memoizeFn from '@theatre/shared/utils/memoizeFn'

type ControlledPlaybackStateBox = Box<
  undefined | IDerivation<{range: IPlaybackRange; isFollowingARange: boolean}>
>
export const getPlaybackStateBox = memoizeFn(
  // sequence is just the key to this memo
  (_sequence: Sequence): ControlledPlaybackStateBox => {
    const box = new Box(undefined) as ControlledPlaybackStateBox
    return box
  },
)
