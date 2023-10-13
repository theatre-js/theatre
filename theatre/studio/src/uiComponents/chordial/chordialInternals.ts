import {Atom} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {basicFSM} from '@theatre/utils/basicFSM'
import type {$IntentionalAny} from '@theatre/utils/types'
import type {ElementType, MutableRefObject, ReactNode} from 'react'

export type ChordialOpts = {
  // shown on the tooltip
  title: string | ReactNode
  // shown as the top item in the menu
  menuTitle?: string | React.ReactElement
  items: Array<ContextMenuItem>
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

export const hoverActor = basicFSM<
  [event: MouseEvent, top: 'window' | 'root'],
  ChodrialElement | undefined
>((transition) => {
  function idle() {
    transition('idle', undefined, ([e, top]) => {
      if (top === 'window') return
      const chordialEl = findChodrialByDomNode(e.target)
      if (!chordialEl) return
      active(chordialEl)
    })
  }

  function active(originalEl: ChodrialElement) {
    const activationTime = Date.now()
    transition('active', originalEl, ([e, top]) => {
      if (top === 'window') {
        if (Date.now() - activationTime > 100) {
          idle()
        }
        return
      }

      const newEl = findChodrialByDomNode(e.target)
      if (newEl === originalEl) {
        active(originalEl)
        return
      }
      if (!newEl) {
        idle()
        return
      }
      active(newEl)
    })
  }

  idle()
})()

type MaybeChodrialEl = ChodrialElement | undefined

/**
 * A state machine that determines which Chordial target should have a tooltip shown.
 */
const tooltipMachine = basicFSM<MaybeChodrialEl, MaybeChodrialEl>(
  (transition) => {
    function idle() {
      transition('idle', undefined, (newHover: MaybeChodrialEl) => {
        if (!newHover) return
        waitingForActive(newHover)
      })
    }

    // a 1s timeout before showing the tooltip
    function waitingForActive(originalHover: ChodrialElement) {
      const timeout = setTimeout(() => {
        active(originalHover)
      }, 800)

      transition('waitingForActive', undefined, (newHover) => {
        clearTimeout(timeout)
        if (newHover) {
          waitingForActive(newHover)
        } else {
          idle()
        }
      })
    }

    function active(currentHover: ChodrialElement) {
      transition('active', currentHover, (newHover) => {
        if (newHover) {
          active(newHover)
        } else {
          waitingForIdle(currentHover)
        }
      })
    }

    function waitingForIdle(currentHover: ChodrialElement) {
      const timeout = setTimeout(() => {
        waitingForRevive()
      }, 200)
      transition('waitingForIdle', currentHover, (newHover) => {
        if (!newHover) return
        clearTimeout(timeout)
        active(newHover)
      })
    }

    function waitingForRevive() {
      const timeout = setTimeout(() => {
        idle()
      }, 300)

      transition('waitingForRevive', undefined, (newHover) => {
        if (!newHover) return
        clearTimeout(timeout)
        active(newHover)
      })
    }

    idle()
  },
)

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

function findChodrialByDomNode(
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

const activeHoverTarget = prism(() => val(hoverActor.pointer))

const tooltipActor = tooltipMachine()

activeHoverTarget.onStale(() => {
  tooltipActor.send(activeHoverTarget.getValue())
})

export const tooltipTarget = prism(() => val(tooltipActor.pointer))
