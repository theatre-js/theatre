import type Sheet from '@theatre/core/sheets/Sheet'
import getStudio from '@theatre/studio/getStudio'
import type useDrag from '@theatre/studio/uiComponents/useDrag'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import subPrism from '@theatre/shared/utils/subPrism'
import type {
  IRange,
  PositionInScreenSpace,
  StrictRecord,
} from '@theatre/shared/utils/types'
import {valToAtom} from '@theatre/shared/utils/valToAtom'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {Atom, prism, val} from '@theatre/dataverse'
import type {SequenceEditorTree} from './tree'
import {calculateSequenceEditorTree} from './tree'
import {clamp} from 'lodash-es'
import type {
  KeyframeId,
  ObjectAddressKey,
  SequenceTrackId,
} from '@theatre/shared/utils/ids'

// A Side is either the left side of the panel or the right side
type DimsOfPanelPart = {
  width: number
  height: number
  /**
   * In absolute pixels, relative to getBoundingClientRect()
   */
  screenX: PositionInScreenSpace
  /**
   * In absolute pixels, relative to getBoundingClientRect()
   */
  screenY: PositionInScreenSpace
}

export type PanelDims = {
  width: number
  height: number
  widthWithoutBorder: number
  heightWithoutBorder: number
  screenX: PositionInScreenSpace
  screenY: PositionInScreenSpace
}

export type DopeSheetSelection = {
  type: 'DopeSheetSelection'
  byObjectKey: StrictRecord<
    ObjectAddressKey,
    {
      byTrackId: StrictRecord<
        SequenceTrackId,
        {
          byKeyframeId: StrictRecord<KeyframeId, true>
        }
      >
    }
  >
  getDragHandlers(
    origin: SheetObjectAddress & {
      positionAtStartOfDrag: number
      domNode: Element
    },
  ): Parameters<typeof useDrag>[1]
  delete(): void
}

/**
 * @remarks
 * In order to lay out the playhead and the keyframes on the sequence editor,
 * we map their position to different spaces based on the zoom and scroll.
 *
 * These spaces are called `unitSpace`, `scaledSpace`, and `clippedSpace`.
 *
 * * `unitSpace` is the space the sequence is in. So, `5 seconds` in unitSpace
 * would equal `5`.
 *
 * * `scaledSpace` basically takes into account zoom level, but not scroll.
 *
 * * `clippedSpace` is just like `scaledSpace`, but also accounts for scroll.
 *
 *
 *                           2 seconds ─┐                      #
 *                                      ▼                      # 2 seconds would represent as `2` in unitSpace
 * `unitSpace`              00    01    02    03    04    05   # regardless of zoom or scroll.
 *                                      |                      #
 * ─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────
 *                                      |                      #
 *                                      ▼                      # If zoom=1, then scaledSpace acts the same as
 * `scaledSpace`            00    01    02    03    04    05   # unitSpace.
 * (zoom=1)                             |                      #
 * ─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────
 *                                ┌─────┘                      #
 *                                ▼     |                      # We're zoomed out (zoom=0.5), so 2 seconds
 * `scaledSpace`            00 01 02 03 04 05 06 07 08 09 10   # falls on the position of 1 second (2 * 0.5 = 1).
 *  (zoom=0.5)                    |     |                      #
 * ───────────────────────────────┼─────┼───────────────────────────────────────────────────────────────────────
 *                                └─────┼───────────┐          #
 *                                      |           ▼          # We're zoomed in (zoom=2), so 2 seconds
 * `scaledSpace`            00          01          02         # falls on the position of 4 seconds (2 * 2 = 4).
 *  (zoom=2)                            |           |          #
 * ─────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────
 *                                      ┌───────────┘          #
 *                                      │                      # With no zoom or scroll, clippedSpace is
 * `clippedSpace`                       ▼                      # just like unitSpace.
 *  (zoom=1, scroll=0)      00    01    02    03    04    05   #
 * ─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────
 *                                      |                      #
 *                                ┌─────┘                      # No zoom, but we're scrolled in by 1 seconds,
 * `clippedSpace`                 ▼     |                      # so everything shifts 1s back.
 *  (zoom=1, scroll=1)      01    02    03    04    05    06   #
 * ────────────────────────────────┼────┼───────────────────────────────────────────────────────────────────────
 *                                 └────┐                      #
 *                                      ▼                      # Zoomed in 2x with 1s of scroll.
 * `clippedSpace` (zoom=2,  01          02          03         #
 *               scroll=1)                                     #
 * ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 */
export type SequenceEditorPanelLayout = {
  sheet: Sheet
  tree: SequenceEditorTree
  panelDims: PanelDims
  leftDims: DimsOfPanelPart
  rightDims: DimsOfPanelPart
  dopeSheetDims: DimsOfPanelPart
  graphEditorDims: DimsOfPanelPart & {
    isAvailable: boolean
    isOpen: boolean
    padding: {top: number; bottom: number}
  }
  horizontalScrollbarDims: {bottom: number}
  graphEditorVerticalSpace: {
    space: number
    fromExtremumSpace(e: number): number
    toExtremumSpace(e: number): number
  }
  seeker: {
    isSeeking: boolean
    setIsSeeking: (isSeeking: boolean) => void
  }
  unitSpace: {}
  scaledSpace: {
    leftPadding: number
    fromUnitSpace(u: number): number
    toUnitSpace(s: number): number
  }
  clippedSpace: {
    /**
     * The width of the visible area of the sequence (pretty much the right side of the panel)
     */
    width: number
    fromUnitSpace(u: number): number
    toUnitSpace(c: number): number
    range: IRange
    setRange(range: IRange): void
  }

  selectionAtom: Atom<{current?: DopeSheetSelection}>
}

// type UnitSpaceProression = number
// type ClippedSpaceProgression = number

/**
 * This means the left side of the panel is 20% of its width, and the
 * right side is 80%
 */
const panelSplitRatio = 0.2

const initialClippedSpaceRange: IRange = {start: 0, end: 10}

export function sequenceEditorPanelLayout(
  sheet: Sheet,
  panelDimsP: Pointer<PanelDims>,
): IDerivation<Pointer<SequenceEditorPanelLayout>> {
  const studio = getStudio()!

  const ahistoricStateP =
    studio.atomP.ahistoric.projects.stateByProjectId[sheet.address.projectId]
      .stateBySheetId[sheet.address.sheetId]
  const historicStateP =
    studio.atomP.historic.projects.stateByProjectId[sheet.address.projectId]
      .stateBySheetId[sheet.address.sheetId]

  return prism(() => {
    const tree = subPrism(
      'tree',
      () => calculateSequenceEditorTree(sheet, studio),
      [],
    )

    const panelDims = val(panelDimsP)
    const graphEditorState = val(
      studio.atomP.historic.panels.sequenceEditor.graphEditor,
    )

    const selectedPropsByObject = val(
      historicStateP.sequenceEditor.selectedPropsByObject,
    )

    const graphEditorAvailable =
      !!selectedPropsByObject && Object.keys(selectedPropsByObject).length > 0

    const {
      leftDims,
      rightDims,
      graphEditorDims,
      dopeSheetDims,
      horizontalScrollbarDims,
    } = prism.memo(
      'leftDims',
      () => {
        const leftDims: DimsOfPanelPart = {
          width: Math.floor(panelDims.width * panelSplitRatio),
          height: panelDims.height,
          screenX: panelDims.screenX,
          screenY: panelDims.screenY,
        }
        const rightDims: DimsOfPanelPart = {
          width: panelDims.width - leftDims.width,
          height: panelDims.height,
          screenX: (panelDims.screenX +
            leftDims.width) as PositionInScreenSpace,
          screenY: panelDims.screenY,
        }

        const graphEditorOpen =
          graphEditorAvailable && graphEditorState?.isOpen === true

        const graphEditorHeight = Math.floor(
          (graphEditorOpen
            ? clamp(graphEditorState?.height ?? 0.5, 0.1, 0.7)
            : 0) * panelDims.heightWithoutBorder,
        )

        const bottomHeight = 0 + graphEditorHeight
        const dopeSheetHeight = panelDims.height - bottomHeight

        const dopeSheetDims: SequenceEditorPanelLayout['dopeSheetDims'] = {
          width: panelDims.width,
          height: dopeSheetHeight,
          screenX: panelDims.screenX,
          screenY: panelDims.screenY,
        }

        // const graphEditorHeight = panelDims.height - dopeSheetDims.height
        const graphEditorDims: SequenceEditorPanelLayout['graphEditorDims'] = {
          isAvailable: graphEditorAvailable,
          isOpen: graphEditorOpen,
          width: rightDims.width,
          height: graphEditorHeight,
          screenX: panelDims.screenX,
          screenY: panelDims.screenY + dopeSheetHeight,
          padding: {
            top: 20,
            bottom: 20,
          },
        }

        const horizontalScrollbarDims: SequenceEditorPanelLayout['horizontalScrollbarDims'] =
          {
            bottom: graphEditorOpen ? 0 : 0,
          }

        return {
          leftDims,
          rightDims,
          graphEditorDims,
          dopeSheetDims,
          horizontalScrollbarDims,
        }
      },
      [panelDims, graphEditorState, graphEditorAvailable],
    )

    const graphEditorVerticalSpace = prism.memo(
      'graphEditorVerticalSpace',
      (): SequenceEditorPanelLayout['graphEditorVerticalSpace'] => {
        const space =
          graphEditorDims.height -
          graphEditorDims.padding.top -
          graphEditorDims.padding.bottom
        return {
          space,
          fromExtremumSpace(ex: number): number {
            return ex * space
          },
          toExtremumSpace(s: number): number {
            return s / space
          },
        }
      },
      [graphEditorDims],
    )

    const [isSeeking, setIsSeeking] = prism.state('isSeeking', false)

    const seeker = {
      isSeeking,
      setIsSeeking,
    }

    const unitSpace = {}

    const clippedSpaceRange =
      val(ahistoricStateP.sequence.clippedSpaceRange) ??
      initialClippedSpaceRange

    const scaledSpace: SequenceEditorPanelLayout['scaledSpace'] = prism.memo(
      'scaledSpace',
      () => {
        const unitsShownInClippedSpace =
          clippedSpaceRange.end - clippedSpaceRange.start

        const pixelsShownInClippedSpace = rightDims.width

        const unitToPixelRatio =
          unitsShownInClippedSpace / pixelsShownInClippedSpace

        const pixelToUnitRatio =
          pixelsShownInClippedSpace / unitsShownInClippedSpace

        return {
          fromUnitSpace(u: number): number {
            return u * pixelToUnitRatio
          },
          toUnitSpace(s: number): number {
            return s * unitToPixelRatio
          },
          leftPadding: 10,
        }
      },
      [clippedSpaceRange, rightDims.width],
    )

    const setClippedSpaceRange = prism.memo(
      'setClippedSpaceRange',
      () => {
        return function setClippedSpaceRange(_range: IRange): void {
          studio.transaction(({stateEditors}) => {
            const range = {..._range}
            if (range.end <= range.start) {
              range.end = range.start + 1
            }
            if (range.start < 0) {
              const length = range.end - range.start
              range.start = 0
              range.end = length
            }

            stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.clippedSpaceRange.set(
              {...sheet.address, range},
            )
          })
        }
      },
      [],
    )

    const clippedSpace: SequenceEditorPanelLayout['clippedSpace'] = prism.memo(
      'clippedSpace',
      () => {
        return {
          range: clippedSpaceRange,
          width: rightDims.width,
          fromUnitSpace(u: number): number {
            return (
              scaledSpace.fromUnitSpace(u - clippedSpaceRange.start) +
              scaledSpace.leftPadding
            )
          },
          toUnitSpace(c: number): number {
            return (
              scaledSpace.toUnitSpace(c - scaledSpace.leftPadding) +
              clippedSpaceRange.start
            )
          },
          setRange: setClippedSpaceRange,
        }
      },
      [clippedSpaceRange, rightDims.width, scaledSpace, setClippedSpaceRange],
    )

    const selectionAtom = prism.memo(
      'selection.current',
      (): SequenceEditorPanelLayout['selectionAtom'] => {
        return new Atom({})
      },
      [],
    )

    const finalAtom = valToAtom<SequenceEditorPanelLayout>('finalAtom', {
      sheet,
      tree,
      panelDims,
      leftDims,
      rightDims,
      dopeSheetDims,
      horizontalScrollbarDims,
      seeker,
      unitSpace,
      scaledSpace,
      clippedSpace,
      graphEditorDims,
      graphEditorVerticalSpace,
      selectionAtom,
    })

    return finalAtom.pointer
  })
}
