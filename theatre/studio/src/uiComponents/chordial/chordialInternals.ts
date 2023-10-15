import {Atom} from '@theatre/dataverse'
import type {$IntentionalAny, VoidFn} from '@theatre/utils/types'
import type {ElementType, MutableRefObject} from 'react'
import type {DragOpts} from '@theatre/studio/uiComponents/useDrag'
import type React from 'react'

export type ChordialOpts = {
  // shown on the tooltip
  title: string | React.ReactNode
  // shown as the top item in the menu
  menuTitle?: string | React.ReactNode
  items: Array<ContextMenuItem>
  focus?:
    | {
        type: 'callback'
        callback: (e: MouseEvent) => VoidFn
      }
    | {type: 'Popover'; node: React.ReactNode}
  drag?: DragOpts
}

export type ContextMenuItem = {
  type: 'normal'
  label: string | ElementType
  callback?: (e: React.MouseEvent) => void
  focus?: () => void
  enabled?: boolean
  key?: string
}

export type ChordialOptsFn = () => ChordialOpts

export type ChodrialElement = {
  id: string
  returnValue: {
    targetRef: MutableRefObject<$IntentionalAny>
  }
  target: HTMLElement | null | undefined
  atom: Atom<{optsFn: ChordialOptsFn}>
}

export type MaybeChodrialEl = ChodrialElement | undefined

let lastId = 0

export function createChordialElement(optsFn: ChordialOptsFn): ChodrialElement {
  const id = (lastId++).toString()
  const chordialRef: ChodrialElement = {
    id,
    target: null,
    atom: new Atom({optsFn}),
    returnValue: {
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
