import getStudio from '@theatre/studio/getStudio'
import {prism, val} from '@theatre/dataverse'
import type Sequence from '@theatre/core/sequences/Sequence'
import memoizeFn from '@theatre/shared/utils/memoizeFn'
import {getPlaybackStateBox} from './ControlledPlaybackStateBox'

/*
 * A memoized function that returns a derivation with a boolean value.
 * This value is set to `true` if:
 * 1. the playback is playing and using the focus range instead of the whole sequence
 * 2. the playback is stopped, but would use the focus range if it were started.
 */

export const getIsPlayheadAttachedToFocusRange = memoizeFn(
  (sequence: Sequence) =>
    prism<boolean>(() => {
      const controlledPlaybackState =
        getPlaybackStateBox(sequence).derivation.getValue()
      if (controlledPlaybackState) {
        return controlledPlaybackState.getValue().isFollowingARange
      } else {
        const {projectId, sheetId} = sequence.address
        const focusRange = val(
          getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
            .stateBySheetId[sheetId].sequence.focusRange,
        )

        if (!focusRange || !focusRange.enabled) return false

        const pos = val(sequence.pointer.position)

        const withinRange =
          pos >= focusRange.range.start && pos <= focusRange.range.end
        return withinRange
      }
    }),
)
