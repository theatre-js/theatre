import {basicFSM} from '@theatre/utils/basicFSM'
import type {DragHandlers, DragOpts} from '@theatre/studio/uiComponents/useDrag'
import {
  DRAG_DETECTION_DISTANCE_THRESHOLD,
  MouseButton,
  didPointerLockCauseMovement,
} from '@theatre/studio/uiComponents/useDrag'
import {isSafari} from '@theatre/studio/uiComponents/isSafari'
import type {CapturedPointer} from '@theatre/studio/UIRoot/PointerCapturing'
import {createPointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'
import type {
  ChodrialElement,
  ChordialOpts,
  InvokeType,
} from './chordialInternals'
import {findChodrialByDomNode} from './chordialInternals'
import {popoverActor} from './popoverActor'

function handleInvoke(
  invoke: undefined | InvokeType,
  el: ChodrialElement,
  mouseEvent: MouseEvent,
) {
  if (!invoke) return
  if (typeof invoke === 'function') {
    invoke({type: 'MouseEvent', event: mouseEvent})
  } else if (invoke.type === 'popover') {
    popoverActor.send({type: 'open', el, triggerEvent: mouseEvent})
  }
}

export const gestureActor = basicFSM<
  | {type: 'mousedown'; mouseEvent: MouseEvent}
  | {type: 'mouseup'; mouseEvent: MouseEvent}
  | {type: 'mousemove'; mouseEvent: MouseEvent}
  | {type: 'click'; mouseEvent: MouseEvent},
  undefined | ChodrialElement
>((t) => {
  function idle() {
    t('idle', undefined, (e) => {
      switch (e.type) {
        case 'click':
          {
            const el = findChodrialByDomNode(e.mouseEvent.target)
            if (!el) return
            const {invoke} = el.atom.get().optsFn()
            handleInvoke(invoke, el, e.mouseEvent)
          }
          break
        case 'mousedown':
          {
            const el = findChodrialByDomNode(e.mouseEvent.target)
            if (!el) return
            const opts = el.atom.get().optsFn()
            const {drag} = opts
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
              createPointerCapturing('Drag').capturing.capturePointer(
                'dragStart',
              )

            if (!drag.dontBlockMouseDown) {
              e.mouseEvent.stopPropagation()
              e.mouseEvent.preventDefault()
            }

            beforeDetected(
              el,
              opts,
              drag,
              e.mouseEvent,
              dragHandlers,
              0,
              capturedPointer,
            )
          }
          break
        default:
          break
      }
    })
  }

  function handleMouseup(
    el: ChodrialElement,
    opts: ChordialOpts,
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

    if (!dragHappened) {
      handlers.onClick?.(e)
      handleInvoke(opts.invoke, el, e)
      // opts.invoke?.({type: 'MouseEvent', event: e})
    }
    idle()
  }

  function beforeDetected(
    el: ChodrialElement,
    opts: ChordialOpts,
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
            el,
            opts,
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
              opts,
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
    opts: ChordialOpts,
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
          handleMouseup(
            el,
            opts,
            dragOpts,
            e.mouseEvent,
            handlers,
            true,
            capturedPointer,
          )
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
            opts,
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
