import {Atom} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {basicFSM} from '@theatre/utils/basicFSM'
import type {$IntentionalAny, VoidFn} from '@theatre/utils/types'
import type {ElementType, MutableRefObject} from 'react'
import type {DragHandlers, DragOpts} from '@theatre/studio/uiComponents/useDrag'
import {
  DRAG_DETECTION_DISTANCE_THRESHOLD,
  MouseButton,
  didPointerLockCauseMovement,
} from '@theatre/studio/uiComponents/useDrag'
import {isSafari} from '@theatre/studio/uiComponents/isSafari'
import type {CapturedPointer} from '@theatre/studio/UIRoot/PointerCapturing'
import {createPointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'

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

export const hoverActor = basicFSM<
  {type: 'mousemove'; mouseEvent: MouseEvent; source: 'window' | 'root'},
  ChodrialElement | undefined
>((transition) => {
  function idle() {
    transition('idle', undefined, (e) => {
      switch (e.type) {
        case 'mousemove':
          if (e.source === 'window') return
          const chordialEl = findChodrialByDomNode(e.mouseEvent.target)
          if (!chordialEl) return
          active(chordialEl)
          break
      }
    })
  }

  function active(originalEl: ChodrialElement) {
    const activationTime = Date.now()
    transition('active', originalEl, (e) => {
      switch (e.type) {
        case 'mousemove':
          if (e.source === 'window') {
            if (Date.now() - activationTime > 100) {
              idle()
            }
            return
          }

          const newEl = findChodrialByDomNode(e.mouseEvent.target)
          if (newEl === originalEl) {
            active(originalEl)
            return
          }
          if (!newEl) {
            idle()
            return
          }
          active(newEl)
          break
      }
    })
  }

  idle()
})()

export const contextActor = basicFSM<
  | {type: 'rclick'; mouseEvent: MouseEvent}
  | {type: 'requestClose'; element: ChodrialElement},
  {element: ChodrialElement; originalMouseEvent: MouseEvent} | undefined
>((t) => {
  function idle() {
    t('idle', undefined, (e) => {
      switch (e.type) {
        case 'rclick':
          const chordialEl = findChodrialByDomNode(e.mouseEvent.target)
          if (chordialEl) {
            active(e.mouseEvent, chordialEl)
          }
          break
        default:
          break
      }
    })
  }

  function active(originalEvent: MouseEvent, originalEl: ChodrialElement) {
    originalEvent.preventDefault()
    originalEvent.stopPropagation()
    t(
      'active',
      {element: originalEl, originalMouseEvent: originalEvent},
      (e) => {
        switch (e.type) {
          case 'rclick':
            const newEl = findChodrialByDomNode(e.mouseEvent.target)
            if (!newEl) return idle()
            active(e.mouseEvent, newEl)
            break
          case 'requestClose':
            if (e.element === originalEl) {
              idle()
            }
            break
        }
      },
    )
  }

  idle()
})({name: 'contextActor'})

const currentContext = prism(() => val(contextActor.pointer))
currentContext.onStale(() => {
  const contextOpen = !!val(currentContext)

  tooltipActor.send({
    type: contextOpen ? 'contextMenuOpen' : 'contextMenuClose',
  })
})

type MaybeChodrialEl = ChodrialElement | undefined

/**
 * A state machine that determines which Chordial target should have a tooltip shown.
 */
const tooltipActor = basicFSM<
  | {type: 'hoverTargetChange'; element: MaybeChodrialEl}
  | {type: 'contextMenuOpen'}
  | {type: 'contextMenuClose'},
  MaybeChodrialEl
>((transition) => {
  function contextMenuOpen() {
    transition('contextMenuOpen', undefined, (e) => {
      switch (e.type) {
        case 'contextMenuClose':
          idle()
          break
        default:
          return
      }
    })
  }

  const wrap = (
    stateName: string,
    context: MaybeChodrialEl,
    take: (newHover: MaybeChodrialEl) => void,
  ): {isActive: boolean} => {
    const status = {isActive: true}
    transition(stateName, context, (e) => {
      switch (e.type) {
        case 'contextMenuOpen':
          status.isActive = false
          contextMenuOpen()
          break
        case 'hoverTargetChange':
          take(e.element)
          break
        default:
          // ?
          break
      }
    })
    return status
  }

  function idle() {
    wrap('idle', undefined, (newHover: MaybeChodrialEl) => {
      if (!newHover) return
      waitingForActive(newHover)
    })
  }

  // a 1s timeout before showing the tooltip
  function waitingForActive(originalHover: ChodrialElement) {
    const timeout = setTimeout(() => {
      if (status.isActive) active(originalHover)
    }, 800)

    const status = wrap('waitingForActive', undefined, (newHover) => {
      clearTimeout(timeout)
      if (newHover) {
        waitingForActive(newHover)
      } else {
        idle()
      }
    })
  }

  function active(currentHover: ChodrialElement) {
    wrap('active', currentHover, (newHover) => {
      if (newHover) {
        active(newHover)
      } else {
        waitingForIdle(currentHover)
      }
    })
  }

  function waitingForIdle(currentHover: ChodrialElement) {
    const timeout = setTimeout(() => {
      if (status.isActive) waitingForRevive()
    }, 200)
    const status = wrap('waitingForIdle', currentHover, (newHover) => {
      if (!newHover) return
      clearTimeout(timeout)
      active(newHover)
    })
  }

  function waitingForRevive() {
    const timeout = setTimeout(() => {
      if (status.isActive) idle()
    }, 300)

    const status = wrap('waitingForRevive', undefined, (newHover) => {
      if (!newHover) return
      clearTimeout(timeout)
      active(newHover)
    })
  }

  idle()
})({name: 'tooltipActor'})

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

const activeHoverTarget = prism(() => val(hoverActor.pointer))

activeHoverTarget.onStale(() => {
  tooltipActor.send({
    type: 'hoverTargetChange',
    element: activeHoverTarget.getValue(),
  })
})

export const tooltipTarget = prism(() => val(tooltipActor.pointer))

export const contextStatus = prism(() => val(contextActor.pointer))

export const gestureActor = basicFSM<
  | {type: 'mousedown'; mouseEvent: MouseEvent}
  | {type: 'mouseup'; mouseEvent: MouseEvent}
  | {type: 'mousemove'; mouseEvent: MouseEvent},
  undefined | ChodrialElement
>((t) => {
  function idle() {
    t('idle', undefined, (e) => {
      switch (e.type) {
        case 'mousedown':
          const el = findChodrialByDomNode(e.mouseEvent.target)
          if (!el) return
          const {drag} = el.atom.get().optsFn()
          if (!drag || drag.disabled === true) return

          // defensively release
          // TIODO
          // capturedPointerRef.current?.release()

          const acceptedButtons: MouseButton[] = drag.buttons ?? [
            MouseButton.Left,
          ]

          if (!acceptedButtons.includes(e.mouseEvent.button)) return

          const dragHandlers = drag.onDragStart(e.mouseEvent)

          if (dragHandlers === false) {
            // we should ignore the gesture
            return
          }

          // need to capture pointer after we know the provided handler wants to handle drag start
          const capturedPointer =
            createPointerCapturing('Drag').capturing.capturePointer('dragStart')

          if (!drag.dontBlockMouseDown) {
            e.mouseEvent.stopPropagation()
            e.mouseEvent.preventDefault()
          }

          beforeDetected(
            el,
            drag,
            e.mouseEvent,
            dragHandlers,
            0,
            capturedPointer,
          )
          break
        default:
          break
      }
    })
  }

  function handleMouseup(
    dragOpts: DragOpts,
    e: MouseEvent,
    handlers: DragHandlers,
    dragHappened: boolean,
    capturedPointer?: CapturedPointer,
  ) {
    capturedPointer?.release()
    if (dragOpts.shouldPointerLock && !isSafari) document.exitPointerLock()
    handlers.onDragEnd?.(dragHappened, e)

    // ensure that the window is focused after a successful drag
    // this fixes an issue where after dragging something like the playhead
    // through an iframe, you can immediately hit [space] and the animation
    // will play, even if you hadn't been focusing in the iframe at the start
    // of the drag.
    // Fixes https://linear.app/theatre/issue/P-177/beginners-scrubbing-the-playhead-from-within-an-iframe-then-[space]
    window.focus()

    handlers.onClick?.(e)
    idle()
  }

  function beforeDetected(
    el: ChodrialElement,
    dragOpts: DragOpts,
    mousedownEvent: MouseEvent,
    handlers: DragHandlers,
    originalTotalDistanceMoved: number,
    capturedPointer: CapturedPointer,
  ) {
    t('beforeDetected', el, (e) => {
      switch (e.mouseEvent.type) {
        case 'mouseup':
          handleMouseup(
            dragOpts,
            e.mouseEvent,
            handlers,
            false,
            capturedPointer,
          )

          break
        case 'mousemove':
          const isPointerLockUsed = dragOpts.shouldPointerLock && !isSafari

          if (
            didPointerLockCauseMovement(e.mouseEvent, {
              detected: false,
            })
          )
            return

          const totalDistanceMoved =
            originalTotalDistanceMoved +
            Math.abs(e.mouseEvent.movementY) +
            Math.abs(e.mouseEvent.movementX)

          if (totalDistanceMoved > DRAG_DETECTION_DISTANCE_THRESHOLD) {
            if (isPointerLockUsed) {
              el.target!.requestPointerLock()
            }

            const stuff = {
              // detected: true,
              dragMovement: {x: 0, y: 0},
              dragEventCount: 0,
            }

            afterDetected(
              el,
              dragOpts,
              mousedownEvent,
              handlers,
              totalDistanceMoved,
              stuff.dragMovement,
              stuff.dragEventCount,
              capturedPointer,
            )
          }

          break
      }
    })
  }

  function afterDetected(
    el: ChodrialElement,
    dragOpts: DragOpts,
    mousedownEvent: MouseEvent,
    handlers: DragHandlers,
    originalTotalDistanceMoved: number,
    originalDragMovement: {x: number; y: number},
    dragEventCount: number,
    capturedPointer: CapturedPointer,
  ) {
    t('afterDetected', el, (e) => {
      switch (e.mouseEvent.type) {
        case 'mouseup':
          handleMouseup(dragOpts, e.mouseEvent, handlers, true, capturedPointer)
          break
        case 'mousemove':
          const isPointerLockUsed = dragOpts.shouldPointerLock && !isSafari

          if (
            didPointerLockCauseMovement(e.mouseEvent, {
              detected: true,
              dragEventCount,
            })
          )
            return

          const totalDistanceMoved =
            originalTotalDistanceMoved +
            Math.abs(e.mouseEvent.movementY) +
            Math.abs(e.mouseEvent.movementX)

          const dragMovement = isPointerLockUsed
            ? {
                // when locked, the pointer event screen position is going to be 0s, since the pointer can't move.
                // So, we use the movement on the event
                x: originalDragMovement.x + e.mouseEvent.movementX,
                y: originalDragMovement.y + e.mouseEvent.movementY,
              }
            : {
                x: e.mouseEvent.screenX - mousedownEvent.screenX,
                y: e.mouseEvent.screenY - mousedownEvent.screenY,
              }

          handlers.onDrag(
            dragMovement.x,
            dragMovement.y,
            e.mouseEvent,
            e.mouseEvent.movementX,
            e.mouseEvent.movementY,
          )

          afterDetected(
            el,
            dragOpts,
            mousedownEvent,
            handlers,
            totalDistanceMoved,
            dragMovement,
            dragEventCount + 1,
            capturedPointer,
          )

          break
      }
    })
  }

  idle()
})({name: 'gestureActor'})
