import {useEffect} from 'react'
import getStudio from '@theatre/studio/getStudio'
import {cmdIsDown} from '@theatre/studio/utils/keyboardUtils'
import {getSelectedSequence} from '@theatre/studio/selectors'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {prism, val} from '@theatre/dataverse'
import type {IPlaybackRange} from '@theatre/core/sequences/Sequence'
import {getPlaybackStateBox} from './getPlaybackStateBox'

export default function useKeyboardShortcuts() {
  const studio = getStudio()
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target: null | HTMLElement =
        e.composedPath()[0] as unknown as $IntentionalAny
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }

      if (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') {
        if (cmdIsDown(e)) {
          if (e.shiftKey === true) {
            studio.redo()
          } else {
            studio.undo()
          }
        } else {
          return
        }
      } else if (
        e.code === 'Space' &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.ctrlKey
      ) {
        // Control the playback using the `Space` key
        const seq = getSelectedSequence()
        if (seq) {
          if (seq.playing) {
            seq.pause()
          } else {
            /*
             * The sequence will be played in its whole length unless all of the
             * following conditions are met:
             *  1. the focus range is set and enabled
             *  2. the playback starts within the focus range.
             */
            const {projectId, sheetId} = seq.address

            /*
             * The value of this derivation is an array that contains the
             * range of the playback (start and end), and a boolean that is
             * `true` if the playback should be played within that range.
             */
            const controlledPlaybackStateD = prism(
              (): {range: IPlaybackRange; isFollowingARange: boolean} => {
                const focusRange = val(
                  getStudio().atomP.ahistoric.projects.stateByProjectId[
                    projectId
                  ].stateBySheetId[sheetId].sequence.focusRange,
                )

                // Determines whether the playback should be played
                // within the focus range.
                const shouldFollowFocusRange = prism.memo<boolean>(
                  'shouldFollowFocusRange',
                  (): boolean => {
                    const posBeforePlay = seq.position
                    if (focusRange) {
                      const withinRange =
                        posBeforePlay >= focusRange.range.start &&
                        posBeforePlay <= focusRange.range.end
                      if (focusRange.enabled) {
                        if (withinRange) {
                          return true
                        } else {
                          return false
                        }
                      } else {
                        return true
                      }
                    } else {
                      return true
                    }
                  },
                  [],
                )

                if (
                  shouldFollowFocusRange &&
                  focusRange &&
                  focusRange.enabled
                ) {
                  return {
                    range: [focusRange.range.start, focusRange.range.end],
                    isFollowingARange: true,
                  }
                } else {
                  const sequenceLength = val(seq.pointer.length)
                  return {range: [0, sequenceLength], isFollowingARange: false}
                }
              },
            )

            const playbackPromise = seq.playDynamicRange(
              controlledPlaybackStateD.map(({range}) => range),
            )

            const playbackStateBox = getPlaybackStateBox(seq)

            playbackPromise.finally(() => {
              playbackStateBox.set(undefined)
            })

            playbackStateBox.set(controlledPlaybackStateD)
          }
        } else {
          return
        }
      }
      // alt + \
      else if (
        e.altKey &&
        (e.key === '\\' || e.code === 'Backslash' || e.code === 'IntlBackslash')
      ) {
        studio.transaction(({stateEditors, drafts}) => {
          stateEditors.studio.ahistoric.setVisibilityState(
            drafts.ahistoric.visibilityState === 'everythingIsHidden'
              ? 'everythingIsVisible'
              : 'everythingIsHidden',
          )
        })
      } else {
        return
      }

      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
