import {useEffect} from 'react'
import getStudio from '@theatre/studio/getStudio'
import {cmdIsDown} from '@theatre/studio/utils/keyboardUtils'
import {getSelectedSequence} from '@theatre/studio/selectors'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {IDerivation} from '@theatre/dataverse'
import {Box, prism, val} from '@theatre/dataverse'
import type {IPlaybackRange} from '@theatre/core/sequences/Sequence'
import type Sequence from '@theatre/core/sequences/Sequence'
import memoizeFn from '@theatre/shared/utils/memoizeFn'

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
        const seq = getSelectedSequence()
        if (seq) {
          if (seq.playing) {
            seq.pause()
          } else {
            const {projectId, sheetId} = seq.address
            const controlledPlaybackStateD = prism(
              (): {range: IPlaybackRange; isFollowingARange: boolean} => {
                const focusRange = val(
                  getStudio().atomP.ahistoric.projects.stateByProjectId[
                    projectId
                  ].stateBySheetId[sheetId].sequence.focusRange,
                )

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
            if (playbackStateBox.get()) {
              console.warn('this is a bug. fix it before merge :D')
            }

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

type ControlledPlaybackStateBox = Box<
  undefined | IDerivation<{range: IPlaybackRange; isFollowingARange: boolean}>
>

const getPlaybackStateBox = memoizeFn(
  (sequence: Sequence): ControlledPlaybackStateBox => {
    const box = new Box(undefined) as ControlledPlaybackStateBox
    return box
  },
)

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
