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
import {
  stringFromBezierPoints,
  bezierPointsFromString,
  EASING_PRESETS,
  mod,
} from './shared'

const Grid = styled.div`
  display: grid;
  grid-template-areas:
    'search  tween'
    'presets tween';
  grid-template-rows: 35px 1fr;
  grid-template-columns: 150px 150px;
  gap: 6px;
  padding: 6px;
  height: 150px;
`

const OptionsContainer = styled.div`
  overflow: auto;
  grid-area: presets;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: min-content;
  gap: 8px;
  padding: 2px;
`

const SearchBox = styled.input.attrs({type: 'text'})`
  background-color: transparent;
  border: rgba(255, 255, 255, 0.1) solid 1px;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  font: inherit;
  outline: none;
  cursor: text;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  box-sizing: border-box;

  grid-area; search;

  &:focus {
    cursor: text;
  }
`

const CurveEditorContainer = styled.div`
  grid-area: tween;
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

  const fns = useMemo(() => {
    let tempTransaction: CommitOrDiscard | undefined

    return {
      temporarilySetValue(newCurve: string): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }

        const args = bezierPointsFromString(newCurve)
        if (args === null) return

        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
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
                handles: [args[2], args[3], next.handles[2], next.handles[3]],
              },
            ],
          })
        })
      },
      discardTemporaryValue(): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
      },
      permanentlySetValue(newCurve: string): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        const args =
          bezierPointsFromString(newCurve) ??
          bezierPointsFromString(presetSearchResults[0].original.value)

        if (!args) return

        getStudio()!.transaction(({stateEditors}) => {
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
                handles: [args[2], args[3], next.handles[2], next.handles[3]],
              },
            ],
          })
        })

        props.onRequestClose()
      },
    }
  }, [props.layoutP, props.index, presetSearchResults])

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

  const ITEMS_PER_ROW = 3
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const moveHighlightVertical = (n: number) => {
    if (highlightedIndex === null)
      setHighlightedIndex(mod(n, displayedPresets.length))
    else
      setHighlightedIndex(
        mod(highlightedIndex + n * ITEMS_PER_ROW, displayedPresets.length),
      )
  }
  const moveHighlightHorizontal = (n: number) => {
    if (highlightedIndex === null)
      setHighlightedIndex(mod(n, displayedPresets.length))
    else setHighlightedIndex(mod(highlightedIndex + n, displayedPresets.length))
  }
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent scrolling on arrow key press
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault()

    if (e.key === 'ArrowDown') moveHighlightVertical(1)
    if (e.key === 'ArrowUp') moveHighlightVertical(-1)
    if (e.key === 'Escape') props.onRequestClose()
    if (e.key === 'Enter') fns.permanentlySetValue(filter)
  }

  const onEasingOptionKeydown =
    (preset: {label: string; value: string}) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowRight') moveHighlightHorizontal(1)
      if (e.key === 'ArrowLeft') moveHighlightHorizontal(-1)
      if (e.key === 'ArrowUp') moveHighlightVertical(-1)
      if (e.key === 'ArrowDown') moveHighlightVertical(1)
      if (e.key === 'Escape') props.onRequestClose()
      if (e.key === 'Enter') fns.permanentlySetValue(preset.value)
    }
  useLayoutEffect(() => {
    if (highlightedIndex !== null) {
      optionsRef.current?.[
        displayedPresets[highlightedIndex].label
      ]?.current?.focus()
      fns.permanentlySetValue(displayedPresets[highlightedIndex].value)
    }
  }, [highlightedIndex])

  const r = useRef(false)

  useEffect(() => {
    if (!r.current) {
      const easing: [number, number, number, number] = [
        trackData.keyframes[index].handles[2],
        trackData.keyframes[index].handles[3],
        trackData.keyframes[index + 1].handles[0],
        trackData.keyframes[index + 1].handles[1],
      ]
      setFilter(stringFromBezierPoints(easing))
    }
    r.current = false
  }, [trackData])
  useLayoutEffect(() => {
    setTimeout(() => {
      inputRef.current?.select()
      inputRef.current?.focus()
    }, 0)
  }, [])

  return (
    <Grid>
      <SearchBox
        value={filter}
        placeholder="Search presets..."
        onChange={(e) => {
          r.current = true
          setFilter(e.target.value)

          const a = bezierPointsFromString(filter)
          if (a) fns.permanentlySetValue(e.target.value)
        }}
        ref={inputRef}
        onKeyDown={onSearchKeyDown}
      />
      <OptionsContainer>
        {displayedPresets.map((preset, index) => (
          <EasingOption
            key={preset.label}
            easing={preset}
            tabIndex={0}
            onKeyDown={onEasingOptionKeydown(preset)}
            ref={optionsRef.current[preset.label]}
            onClick={() => {
              fns.permanentlySetValue(preset.value)
              //props.onRequestClose()
            }}
            // Temporarily apply on hover
            onMouseOver={() => {
              // When previewing with hover, we don't want to set the filter too
              //fns.temporarilySetValue(preset.value)
            }}
            onMouseOut={() => {
              //fns.discardTemporaryValue()
            }}
          />
        ))}
      </OptionsContainer>
      <CurveEditorContainer>
        <CurveSegmentEditor {...props}></CurveSegmentEditor>
      </CurveEditorContainer>
    </Grid>
  )
}

export default CurveEditorPopover
