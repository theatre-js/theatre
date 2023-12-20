import {Atom} from '@theatre/dataverse'
import type {$IntentionalAny} from '@theatre/core/types/public'
import {useEffect, type ElementType, type MutableRefObject} from 'react'
import type {DragOpts} from '@theatre/studio/uiComponents/useDrag'
import type React from 'react'
import type {AbsolutePlacementBoxConstraints} from '@theatre/studio/uiComponents/Popover/PopoverPositioner'

export type InvokeTypePopover = {
  type: 'popover'
  render: (props: {close: () => void}) => React.ReactElement
  closeWhenPointerIsDistant?: boolean
  pointerDistanceThreshold?: number
  closeOnClickOutside?: boolean
  constraints?: AbsolutePlacementBoxConstraints
  verticalGap?: number
}

export type InvokeType =
  | InvokeTypePopover
  | ((
      e:
        | {
            type: 'MouseEvent'
            event: MouseEvent
          }
        | {
            type: 'KeyboardEvent'
            event: KeyboardEvent
          }
        | undefined,
    ) => void)

export type ChordialOpts = {
  // shown on the tooltip
  title: string | React.ReactNode
  // shown as the top item in the menu
  menuTitle?: string | React.ReactNode
  items: Array<ContextMenuItem>
  invoke?: InvokeType
  drag?: DragOpts
}

export type ContextMenuItem =
  | {
      type: 'normal'
      label: string | ElementType
      callback?: (e: React.MouseEvent) => void
      focus?: () => void
      enabled?: boolean
      key?: string
    }
  | {type: 'separator'}

export type ChordialOptsFn = () => ChordialOpts

export type ChodrialElement = {
  id: string
  returnValue: {
    targetRef: MutableRefObject<$IntentionalAny>
    useDisableTooltip: (disable: boolean) => void
  }
  target: HTMLElement | null | undefined
  atom: Atom<{optsFn: ChordialOptsFn; tooltipDisabled: boolean}>
}

export type MaybeChodrialEl = ChodrialElement | undefined

let lastId = 0

export function createChordialElement(optsFn: ChordialOptsFn): ChodrialElement {
  const id = (lastId++).toString()
  const atom = new Atom({optsFn, tooltipDisabled: false})
  const chordialRef: ChodrialElement = {
    id,
    target: null,
    atom,
    returnValue: {
      useDisableTooltip: (disable: boolean) => {
        useEffect(() => {
          atom.setByPointer((p) => p.tooltipDisabled, disable)
          return () => atom.setByPointer((p) => p.tooltipDisabled, false)
        }, [disable])
      },
      targetRef: {
        get current() {
          return chordialRef.target
        },
        set current(target: HTMLElement | null | undefined) {
          chordialRef.target = target
          if (!target) return
          targetsWeakmap.set(target, chordialRef)
        },
      },
    },
  }

  return chordialRef
}

export function findChodrialByDomNode(
  el: EventTarget | null,
): ChodrialElement | undefined {
  if (!(el instanceof HTMLElement)) return undefined

  let current = el
  while (current) {
    if (targetsWeakmap.has(current)) {
      return targetsWeakmap.get(current)
    }
    current = current.parentElement!
  }
  return undefined
}

const targetsWeakmap = new WeakMap<HTMLElement, ChodrialElement>()
