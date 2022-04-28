import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import type {KeyboardEvent} from 'react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import fuzzy from 'fuzzy'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import type KeyframeEditor from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/KeyframeEditor'
import CurveSegmentEditor from './CurveSegmentEditor'
import EasingOption from './EasingOption'
import type {CubicBezierHandles} from './shared'
import {
  cssCubicBezierArgsFromHandles,
  handlesFromCssCubicBezierArgs,
  EASING_PRESETS,
  areEasingsSimilar,
} from './shared'
import {COLOR_BASE, COLOR_POPOVER_BACK} from './colors'
import useRefAndState from '@theatre/studio/utils/useRefAndState'

const PRESET_COLUMNS = 3
const PRESET_SIZE = 53

const APPROX_TOOLTIP_HEIGHT = 25

const Grid = styled.div`
  background: ${COLOR_POPOVER_BACK};
  display: grid;
  grid-template-areas:
    'search  tween'
    'presets tween';
  grid-template-rows: 32px 1fr;
  grid-template-columns: ${PRESET_COLUMNS * PRESET_SIZE}px 120px;
  padding: 1px;
  gap: 1px;
  height: 120px;
`

const OptionsContainer = styled.div`
  overflow: auto;
  grid-area: presets;

  display: grid;
  grid-template-columns: repeat(${PRESET_COLUMNS}, 1fr);
  grid-auto-rows: min-content;
  gap: 1px;
`

const SearchBox = styled.input.attrs({type: 'text'})`
  background-color: ${COLOR_BASE};
  border: none;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.8);
  padding: 6px;
  font-size: 12px;
  outline: none;
  cursor: text;
  text-align: left;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  grid-area: search;

  &:hover {
    background-color: #212121;
  }

  &:focus {
    background-color: rgba(16, 16, 16, 0.26);
    outline: 1px solid rgba(0, 0, 0, 0.35);
  }
`

const CurveEditorContainer = styled.div`
  grid-area: tween;
  background: ${COLOR_BASE};
`

type IProps = {
  layoutP: Pointer<SequenceEditorPanelLayout>

  /**
   * Called when user hits enter/escape
   */
  onRequestClose: () => void
} & Parameters<typeof KeyframeEditor>[0]

const CurveEditorPopover: React.FC<IProps> = (props) => {
  const [filter, setFilter] = useState<string>('')

  const presetSearchResults = useMemo(
    () =>
      fuzzy.filter(filter, EASING_PRESETS, {
        extract: (el) => el.label,
        pre: '<b>',
        post: '</b>',
      }),

    [filter],
  )

  // Whether to interpret the search box input as a search query
  const useQuery = /^[A-Za-z]/.test(filter)

  const displayedPresets = useMemo(
    () =>
      useQuery
        ? presetSearchResults.map((result) => result.original)
        : EASING_PRESETS,
    [presetSearchResults, useQuery],
  )

  // using an immeditely invoked function so we can properly isolate tempTransaction
  // from other items in this section of the code.
  const editorState = iif(() => {
    const tempTransaction = useRef<CommitOrDiscard | undefined>()
    useEffect(
      () =>
        // clean up function being used to tell when this React component unmounts.
        // in which case we want to actually commit anything that we have outstanding
        () => {
          tempTransaction.current?.commit()
        },
      [tempTransaction],
    )

    // Functions for saving easing data to the actual keyframes
    return useMemo(
      () => ({
        temporarilySetValue(newCurve: string): void {
          tempTransaction.current?.discard()
          tempTransaction.current = undefined

          const args = handlesFromCssCubicBezierArgs(newCurve)
          if (args === null) return

          tempTransaction.current = getStudio()!.tempTransaction(
            ({stateEditors}) => {
              const {replaceKeyframes} =
                stateEditors.coreByProject.historic.sheetsById.sequence

              replaceKeyframes({
                ...props.leaf.sheetObject.address,
                snappingFunction: val(props.layoutP.sheet).getSequence()
                  .closestGridPosition,
                trackId: props.leaf.trackId,
                keyframes: [
                  {
                    ...cur,
                    handles: [cur.handles[0], cur.handles[1], args[0], args[1]],
                  },
                  {
                    ...next,
                    handles: [
                      args[2],
                      args[3],
                      next.handles[2],
                      next.handles[3],
                    ],
                  },
                ],
              })
            },
          )
        },
        discardTemporaryValue(): void {
          tempTransaction.current?.discard()
          tempTransaction.current = undefined
        },
      }),
      [props.layoutP, props.index, presetSearchResults, tempTransaction],
    )
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  // A map to store all html elements corresponding to easing options
  const optionsRef = useRef(
    EASING_PRESETS.reduce((acc, curr) => {
      acc[curr.label] = {current: null}

      return acc
    }, {} as {[key: string]: {current: HTMLDivElement | null}}),
  )

  // Helper functions for moving the highlight in the grid of presets
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const moveHighlightVertical = (n: number) => {
    if (highlightedIndex === null)
      setHighlightedIndex(mod(0, displayedPresets.length))
    else if (highlightedIndex + n < 0) {
      inputRef.current?.select()
      inputRef.current?.focus()
      setHighlightedIndex(null)
    } else
      setHighlightedIndex(
        Math.min(
          highlightedIndex + n * PRESET_COLUMNS,
          displayedPresets.length - 1,
        ),
      )
  }
  const moveHighlightHorizontal = (n: number) => {
    if (highlightedIndex === null)
      setHighlightedIndex(mod(n, displayedPresets.length))
    else if (highlightedIndex + n < 0) {
      inputRef.current?.select()
      inputRef.current?.focus()
      setHighlightedIndex(null)
    } else
      setHighlightedIndex(
        Math.min(highlightedIndex + n, displayedPresets.length - 1),
      )
  }

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    isFilterSetBeingUsed.current = true
    // Prevent scrolling on arrow key press
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault()

    if (e.key === 'ArrowDown') setHighlightedIndex(0)
    else if (e.key === 'ArrowUp') setHighlightedIndex(0)
    else if (e.key === 'Escape') {
      editorState.discardTemporaryValue()
      props.onRequestClose()
    } else if (e.key === 'Enter') {
      props.onRequestClose()
    }
  }
  const onEasingOptionKeydown =
    (preset: {label: string; value: string}) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      isFilterSetBeingUsed.current = true
      if (e.key === 'ArrowRight') moveHighlightHorizontal(1)
      else if (e.key === 'ArrowLeft') moveHighlightHorizontal(-1)
      else if (e.key === 'ArrowUp') moveHighlightVertical(-1)
      else if (e.key === 'ArrowDown') moveHighlightVertical(1)
      else if (e.key === 'Escape') {
        editorState.discardTemporaryValue()
        props.onRequestClose()
      } else if (e.key === 'Enter') {
        props.onRequestClose()
      }
    }

  // When the user navigates highlight between presets, focus the preset el and set the
  // easing data to match the highlighted preset
  useLayoutEffect(() => {
    if (highlightedIndex !== null) {
      const maybeHighlightedPreset = displayedPresets[highlightedIndex]
      if (maybeHighlightedPreset) {
        const maybePresetEl =
          optionsRef.current?.[maybeHighlightedPreset.label]?.current
        maybePresetEl?.focus()
        editorState.temporarilySetValue(maybeHighlightedPreset.value)
      }
    }
  }, [highlightedIndex])

  const easing: CubicBezierHandles = [
    trackData.keyframes[index].handles[2],
    trackData.keyframes[index].handles[3],
    trackData.keyframes[index + 1].handles[0],
    trackData.keyframes[index + 1].handles[1],
  ]

  const isFilterSetBeingUsed = useRef(false)
  useEffect(() => {
    // When the user changes the easing using the UI, change the filter to match.
    if (!isFilterSetBeingUsed.current)
      setFilter(cssCubicBezierArgsFromHandles(easing))
    isFilterSetBeingUsed.current = false
  }, [trackData])

  // Select the easing string on popover open for quick copy&paste
  useLayoutEffect(() => {
    inputRef.current?.select()
    inputRef.current?.focus()
  }, [inputRef.current])

  const [optionsContainerRef, optionsContainer] =
    useRefAndState<HTMLDivElement | null>(null)
  const [optionsScrollPosition, setOptionsScrollPosition] = useState(0)

  useEffect(() => {
    const listener = () => {
      setOptionsScrollPosition(optionsContainer?.scrollTop ?? 0)
    }
    optionsContainer?.addEventListener('scroll', listener)
    return () => optionsContainer?.removeEventListener('scroll', listener)
  }, [optionsContainer])

  return (
    <Grid>
      <SearchBox
        value={filter}
        placeholder="Search presets..."
        onPaste={(e) =>
          // hack to wait for the paste to actually change the e.target.value
          setTimeout(() => {
            if (
              handlesFromCssCubicBezierArgs(
                (e.target as HTMLInputElement).value,
              )
            )
              editorState.temporarilySetValue(
                (e.target as HTMLInputElement).value,
              )
          })
        }
        onChange={(e) => {
          setFilter(e.target.value)
          if (handlesFromCssCubicBezierArgs(e.target.value))
            editorState.temporarilySetValue(e.target.value)
        }}
        ref={inputRef}
        onKeyDown={onSearchKeyDown}
      />
      <OptionsContainer ref={optionsContainerRef}>
        {displayedPresets.map((preset, index) => (
          <EasingOption
            key={preset.label}
            easing={preset}
            tabIndex={0}
            onKeyDown={onEasingOptionKeydown(preset)}
            ref={optionsRef.current[preset.label]}
            onClick={() => {
              setHighlightedIndex(displayedPresets.indexOf(preset))
              editorState.temporarilySetValue(preset.value)
              //props.onRequestClose()
            }}
            tooltipPlacement={
              (optionsRef.current[preset.label].current?.offsetTop ?? 0) -
                (optionsScrollPosition ?? 0) <
              PRESET_SIZE + APPROX_TOOLTIP_HEIGHT
                ? 'bottom'
                : 'top'
            }
            isSelected={areEasingsSimilar(
              easing,
              handlesFromCssCubicBezierArgs(preset.value),
            )}
          />
        ))}
      </OptionsContainer>
      <CurveEditorContainer>
        <CurveSegmentEditor {...props} editorState={editorState} />
      </CurveEditorContainer>
    </Grid>
  )
}

export default CurveEditorPopover

/**
 * n mod m without negative results e.g. `mod(-1,5) = 4` contrasted with `-1 % 5 = -1`.
 *
 * ref: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

/**
 * Immediately invoked function. Used to limit the scope of the argument function.
 */
function iif<T>(fn: () => T): T {
  return fn()
}
