import type {KeyboardEvent} from 'react'
import type React from 'react'
import {useState} from 'react'
import {mod} from './CurveEditorPopover'

export enum Outcome {
  Handled = 1,
  Passthrough = 0,
}
type UIOptionGridOptions<Item> = {
  /** affect behavior of keyboard navigation */
  uiColumns: number
  /** each item in the grid */
  items: Item[]
  /** display of items */
  renderItem: (value: {
    select(e?: Event): void
    /** data item */
    item: Item
    /** arrow key nav */
    isSelected: boolean
  }) => React.ReactNode
  onSelectItem(item: Item): Outcome
  /** Set a callback for what to do if we try to leave the grid */
  canVerticleExit?: (exitSide: 'top' | 'bottom') => Outcome
}
type UIOptionGrid<Item> = {
  focusFirstItem(): void
  onParentEltKeyDown(evt: KeyboardEvent): Outcome
  gridItems: React.ReactNode[]
  currentSelection: Item | null
}
export function useUIOptionGrid<T>(
  options: UIOptionGridOptions<T>,
): UIOptionGrid<T> {
  // Helper functions for moving the highlight in the grid of presets
  const [selectionIndex, setSelectionIndex] = useState<number | null>(null)
  const moveCursorVertical = (vdir: number) => {
    if (selectionIndex === null) {
      if (options.items.length > 0) {
        // start at the top first one
        setSelectionIndex(0)
      } else {
        // no items
      }

      return
    }

    const nextSelectionIndex = selectionIndex + vdir * options.uiColumns
    const exitsTop = nextSelectionIndex < 0
    const exitsBottom = nextSelectionIndex > options.items.length - 1
    if (exitsTop || exitsBottom) {
      // up and out
      if (options.canVerticleExit) {
        if (options.canVerticleExit(exitsTop ? 'top' : 'bottom')) {
          // exited and handled
          setSelectionIndex(null)
          return
        }
      }

      // block the cursor from leaving (don't do anything)
      return
    }

    // we know this highlight is in bounds now
    setSelectionIndex(nextSelectionIndex)
  }
  const moveCursorHorizontal = (hdir: number) => {
    if (selectionIndex === null)
      setSelectionIndex(mod(hdir, options.items.length))
    else if (selectionIndex + hdir < 0) {
      // Don't exit top on potentially a left arrow, bc that might feel like I should be able to exit right on right arrow.
      // Also, maybe cursor selection management in inputs is *lame*.
      setSelectionIndex(null)
    } else
      setSelectionIndex(
        Math.min(selectionIndex + hdir, options.items.length - 1),
      )
  }

  const onParentKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight') moveCursorHorizontal(1)
    else if (e.key === 'ArrowLeft') moveCursorHorizontal(-1)
    else if (e.key === 'ArrowUp') moveCursorVertical(-1)
    else if (e.key === 'ArrowDown') moveCursorVertical(1)
    else return Outcome.Passthrough // so sorry, plz make this not terrible
    return Outcome.Handled
  }

  return {
    focusFirstItem() {
      setSelectionIndex(0)
    },
    onParentEltKeyDown: onParentKeydown,
    gridItems: options.items.map((item, idx) =>
      options.renderItem({
        isSelected: idx === selectionIndex,
        item,
        select(e) {
          setSelectionIndex(idx)
          if (options.onSelectItem(item) === Outcome.Handled) {
            e?.preventDefault()
            e?.stopPropagation()
          }
        },
      }),
    ),
    currentSelection: options.items[selectionIndex ?? -1] ?? null,
  }
}
