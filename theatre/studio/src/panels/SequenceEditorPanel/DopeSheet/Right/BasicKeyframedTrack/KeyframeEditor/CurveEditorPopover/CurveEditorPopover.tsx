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
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {useUIOptionGrid, Outcome} from './useUIOptionGrid'

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

  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  &::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
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

const NoResultsFoundContainer = styled.div`
  grid-column: 1 / 4;
  padding: 6px;
  color: #888888;
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
    /**
     * `tempTransactionPreview` is used when hovering over a curve to preview it. Once
     * the hover ends, `tempTransactionPreview` is discarded.
     */
    const tempTransactionPreview = useRef<CommitOrDiscard | undefined>()
    /**
     * `tempTransactionEdit` is used for all edits in this popover. The transaction
     * is discared if the user presses escape, otherwise it is committed when the
     * popover closes.
     */
    const tempTransactionEdit = useRef<CommitOrDiscard | undefined>()
    useEffect(
      () =>
        // Clean-up function, called when this React component unmounts.
        // When it unmounts, we want to commit edits that are outstanding
        () => {
          tempTransactionEdit.current?.commit()
          tempTransactionPreview.current?.discard()
        },
      [tempTransactionEdit],
    )

    // Functions for saving easing data to the actual keyframes
    return useMemo(
      () => ({
        setEditValue(newCurve: string): void {
          tempTransactionEdit.current?.discard()
          tempTransactionEdit.current = undefined

          const handles = handlesFromCssCubicBezierArgs(newCurve)
          if (handles === null) return

          tempTransactionEdit.current = transactionSetCubicBezier(
            props,
            cur,
            next,
            handles,
          )
        },
        discardEditValue(): void {
          tempTransactionEdit.current?.discard()
          tempTransactionEdit.current = undefined
        },
        setPreviewValue(newCurve: string): void {
          tempTransactionPreview.current?.discard()
          tempTransactionPreview.current = undefined

          const handles = handlesFromCssCubicBezierArgs(newCurve)
          if (handles === null) return

          tempTransactionPreview.current = transactionSetCubicBezier(
            props,
            cur,
            next,
            handles,
          )
        },
        discardPreviewValue(): void {
          tempTransactionPreview.current?.discard()
          tempTransactionPreview.current = undefined
        },
      }),
      [
        props.layoutP,
        props.index,
        presetSearchResults,
        tempTransactionEdit,
        tempTransactionPreview,
      ],
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

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    isFilterUpdatePrevented.current = true
    // Prevent scrolling on arrow key press
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault()

    if (e.key === 'ArrowDown') grid.focusFirstItem()
    else if (e.key === 'Escape') {
      editorState.discardEditValue()
      props.onRequestClose()
    } else if (e.key === 'Enter') {
      props.onRequestClose()
    }
  }

  const easing: CubicBezierHandles = [
    trackData.keyframes[index].handles[2],
    trackData.keyframes[index].handles[3],
    trackData.keyframes[index + 1].handles[0],
    trackData.keyframes[index + 1].handles[1],
  ]

  /**
   * `isFilterUpdatePrevented` is only read in the `useEffect` immediately below.
   * Normally when `trackData` changes for any reason (the Keyframes/easings
   * change via any part of the UI or API), this `useEffect` will change the
   * `filter` to match the easing. `isFilterUpdatePrevented` is set to `true` in
   * a few places to prevent this behaviour. For exmaple, when the user uses
   * the keyboard to preview curves after filtering, the filter should not
   * be replaced with the curve's CSS cubic bezier args.
   */
  const isFilterUpdatePrevented = useRef(false)
  useEffect(() => {
    // When the user changes the easing using the UI, change the filter to match.
    if (!isFilterUpdatePrevented.current)
      setFilter(cssCubicBezierArgsFromHandles(easing))
    isFilterUpdatePrevented.current = false
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

  useEffect(() => {
    if (displayedPresets[0] && isFilterUpdatePrevented.current)
      editorState.setEditValue(displayedPresets[0].value)
  }, [displayedPresets])

  const onEasingOptionKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    isFilterUpdatePrevented.current = true
    if (e.key === 'Escape') {
      editorState.discardEditValue()
      props.onRequestClose()
      e.stopPropagation()
    } else if (e.key === 'Enter') {
      props.onRequestClose()
      e.stopPropagation()
    }
  }

  const grid = useUIOptionGrid({
    items: displayedPresets,
    uiColumns: 3,
    onSelectItem(item) {
      editorState.setEditValue(item.value)
    },
    canVerticleExit(exitSide) {
      if (exitSide === 'top') {
        inputRef.current?.select()
        inputRef.current?.focus()
        return Outcome.Handled
      }
      return Outcome.Passthrough
    },
    renderItem: ({item: preset, select}) => (
      <EasingOption
        key={preset.label}
        easing={preset}
        tabIndex={0}
        onKeyDown={onEasingOptionKeydown}
        ref={optionsRef.current[preset.label]}
        onMouseOver={() => {
          isFilterUpdatePrevented.current = true
          editorState.setPreviewValue(preset.value)
        }}
        onMouseOut={() => editorState.discardPreviewValue()}
        onClick={select}
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
    ),
  })

  // When the user navigates highlight between presets, focus the preset el and set the
  // easing data to match the highlighted preset
  useLayoutEffect(() => {
    if (grid.currentSelection !== null) {
      const maybePresetEl =
        optionsRef.current?.[grid.currentSelection.label]?.current
      maybePresetEl?.focus()
      editorState.setEditValue(grid.currentSelection.value)
    }
  }, [grid.currentSelection])

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
              editorState.setEditValue((e.target as HTMLInputElement).value)
          })
        }
        onChange={(e) => {
          setFilter(e.target.value)
          if (handlesFromCssCubicBezierArgs(e.target.value)) {
            editorState.setEditValue(e.target.value)
          }
        }}
        ref={inputRef}
        onKeyDown={onSearchKeyDown}
      />
      <OptionsContainer
        ref={optionsContainerRef}
        onKeyDown={(evt) => grid.onParentEltKeyDown(evt)}
      >
        {grid.gridItems}
        {grid.gridItems.length === 0 ? (
          <NoResultsFoundContainer>No results found</NoResultsFoundContainer>
        ) : undefined}
      </OptionsContainer>
      <CurveEditorContainer>
        <CurveSegmentEditor {...props} editorState={editorState} />
      </CurveEditorContainer>
    </Grid>
  )
}

export default CurveEditorPopover

// type CurveController = {
//   setHoverPreviewCurve(cssBezierCurve: string): void
//   clearHoverPreviewCurve(cssBezierCurve: string): void
//   setFilter(filterString: string): void
//   searchResults: CurvePresetItem[]
//   showCurve: string
// }

function transactionSetCubicBezier(
  props: IProps,
  cur: Keyframe,
  next: Keyframe,
  newHandles: CubicBezierHandles,
): CommitOrDiscard {
  return getStudio().tempTransaction(({stateEditors}) => {
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
          handles: [
            cur.handles[0],
            cur.handles[1],
            newHandles[0],
            newHandles[1],
          ],
        },
        {
          ...next,
          handles: [
            newHandles[2],
            newHandles[3],
            next.handles[2],
            next.handles[3],
          ],
        },
      ],
    })
  })
}

/**
 * n mod m without negative results e.g. `mod(-1,5) = 4` contrasted with `-1 % 5 = -1`.
 *
 * ref: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
 */
export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

/**
 * Immediately invoked function. Used to limit the scope of the argument function.
 */
function iif<T>(fn: () => T): T {
  return fn()
}
