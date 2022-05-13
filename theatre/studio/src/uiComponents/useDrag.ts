import type {$FixMe} from '@theatre/shared/utils/types'
import {useLayoutEffect, useRef} from 'react'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useCssCursorLock} from './PointerEventsHandler'
import type {CapturedPointer} from '@theatre/studio/UIRoot/PointerCapturing'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'
import noop from '@theatre/shared/utils/noop'
import {isSafari} from './isSafari'

export enum MouseButton {
  Left = 0,
  Middle = 1,
  // Not including Right because it _might_ interfere with chord clicking.
  // So we'll wait for chord-clicking to land before exploring right-button gestures
}

/**
 * dx, dy: delta x/y from the start of the drag
 *
 * Total movement since the start of the drag. This is commonly used with something like "drag keyframe" or "drag handle",
 * where you might be dragging an item around in the UI.
 * @param totalDragDeltaX - x moved total
 * @param totalDragDeltaY - y moved total
 *
 * Movement from the last event / on drag call. This is commonly used with something like "prop nudge".
 * @param dxFromLastEvent - x moved since last event
 * @param dyFromLastEvent - y moved since last event
 */
type OnDragCallback = (
  totalDragDeltaX: number,
  totalDragDeltaY: number,
  event: MouseEvent,
  dxFromLastEvent: number,
  dyFromLastEvent: number,
) => void

type OnDragEndCallback = (dragHappened: boolean) => void

export type UseDragOpts = {
  /**
   * Provide a name for the thing wanting to use the drag helper.
   * This can show up in various errors and potential debug logs to help narrow down.
   */
  debugName: string
  /**
   * Setting it to true will disable the listeners.
   */
  disabled?: boolean
  /**
   * Setting it to true will allow the mouse down events to propagate up
   */
  dontBlockMouseDown?: boolean
  /**
   * Tells the browser to take control of the mouse pointer so that
   * the user can drag endlessly in any direction without hitting the
   * side of their screen.
   *
   * Note: that if we detect that the browser is
   * safari then pointer lock is not used because the pointer lock
   * banner annoyingly shifts the entire page down.
   *
   * ref: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
   */
  shouldPointerLock?: boolean
  /**
   * The css cursor property during the gesture will be locked to this value
   */
  lockCSSCursorTo?: string
  /**
   * Called at the start of the gesture. Mind you, that this would be called, even
   * if the user is just clicking (and not dragging). However, if the gesture turns
   * out to be a click, then `onDragEnd(false)` will be called. Otherwise,
   * a series of `onDrag(dx, dy, event)` events will be called, and the
   * gesture will end with `onDragEnd(true)`.
   *
   *
   * @returns
   * onDragStart can be undefined, in which case, we always handle useDrag,
   * but when defined, we can allow the handler to return false to indicate ignore this dragging
   */
  onDragStart: (event: MouseEvent) =>
    | false
    | {
        /**
         * Called at the end of the drag gesture.
         * `dragHappened` will be `true` if the user actually moved the pointer
         * (if onDrag isn't called, then this will be false becuase the user hasn't moved the pointer)
         */
        onDragEnd?: OnDragEndCallback
        onDrag: OnDragCallback
      }

  // which mouse button to use the drag event
  buttons?:
    | [MouseButton]
    | [MouseButton, MouseButton]
    | [MouseButton | MouseButton | MouseButton]
}

export default function useDrag(
  target: HTMLElement | SVGElement | undefined | null,
  opts: UseDragOpts,
): [isDragging: boolean] {
  const optsRef = useRef<typeof opts>(opts)
  optsRef.current = opts

  const [modeRef, mode] = useRefAndState<
    'dragStartCalled' | 'dragging' | 'notDragging'
  >('notDragging')

  /**
   * Safari has a gross behavior with locking the pointer changes the height of the webpage
   * See {@link UseDragOpts.shouldPointerLock} for more context.
   */
  const isPointerLockUsed = opts.shouldPointerLock && !isSafari

  useCssCursorLock(
    mode === 'dragging' && typeof opts.lockCSSCursorTo === 'string',
    'dragging',
    opts.lockCSSCursorTo,
  )

  const {capturePointer} = usePointerCapturing(`useDrag for ${opts.debugName}`)

  const stateRef = useRef<{
    dragHappened: boolean
    // used when `isPointerLockUsed` is false, so we can calculate
    // dx / dy based on the difference of the moved pointer from the start position of the pointer.
    startPos: {
      x: number
      y: number
    }
    totalMovement: {
      x: number
      y: number
    }
  }>({dragHappened: false, startPos: {x: 0, y: 0}, totalMovement: {x: 0, y: 0}})

  const callbacksRef = useRef<{
    onDrag: OnDragCallback
    onDragEnd: OnDragEndCallback
  }>({onDrag: noop, onDragEnd: noop})

  const capturedPointerRef = useRef<undefined | CapturedPointer>()
  useLayoutEffect(() => {
    if (!target) return

    const dragHandler = (event: MouseEvent) => {
      if (!stateRef.current.dragHappened) {
        stateRef.current.dragHappened = true
        if (isPointerLockUsed) {
          target.requestPointerLock()
        }
      }
      modeRef.current = 'dragging'

      if (didPointerLockCauseMovement(event)) return

      const {totalMovement} = stateRef.current
      if (isPointerLockUsed) {
        // when locked, the pointer event screen position is going to be 0s, since the pointer can't move.
        totalMovement.x += event.movementX
        totalMovement.y += event.movementY
      } else {
        const {startPos} = stateRef.current
        totalMovement.x = event.screenX - startPos.x
        totalMovement.y = event.screenY - startPos.y
      }

      callbacksRef.current.onDrag(
        totalMovement.x,
        totalMovement.y,
        event,
        event.movementX,
        event.movementY,
      )
    }

    const dragEndHandler = () => {
      removeDragListeners()
      modeRef.current = 'notDragging'
      if (opts.shouldPointerLock && !isSafari) document.exitPointerLock()

      callbacksRef.current.onDragEnd(stateRef.current.dragHappened)
    }

    const addDragListeners = () => {
      document.addEventListener('mousemove', dragHandler)
      document.addEventListener('mouseup', dragEndHandler)
    }

    const removeDragListeners = () => {
      capturedPointerRef.current?.release()
      document.removeEventListener('mousemove', dragHandler)
      document.removeEventListener('mouseup', dragEndHandler)
    }

    const preventUnwantedClick = (event: MouseEvent) => {
      if (optsRef.current.disabled) return
      if (stateRef.current.dragHappened) {
        if (
          !optsRef.current.dontBlockMouseDown &&
          modeRef.current !== 'notDragging'
        ) {
          event.stopPropagation()
          event.preventDefault()
        }
        stateRef.current.dragHappened = false
      }
    }

    const dragStartHandler = (event: MouseEvent) => {
      // defensively release
      capturedPointerRef.current?.release()

      const opts = optsRef.current
      if (opts.disabled === true) return

      const acceptedButtons: MouseButton[] = opts.buttons ?? [MouseButton.Left]

      if (!acceptedButtons.includes(event.button)) return

      const returnOfOnDragStart = opts.onDragStart(event)

      if (returnOfOnDragStart === false) {
        // we should ignore the gesture
        return
      }

      callbacksRef.current.onDrag = returnOfOnDragStart.onDrag
      callbacksRef.current.onDragEnd = returnOfOnDragStart.onDragEnd ?? noop

      // need to capture pointer after we know the provided handler wants to handle drag start
      capturedPointerRef.current = capturePointer('Drag start')

      if (!opts.dontBlockMouseDown) {
        event.stopPropagation()
        event.preventDefault()
      }

      modeRef.current = 'dragStartCalled'

      const {screenX, screenY} = event
      stateRef.current = {
        startPos: {x: screenX, y: screenY},
        totalMovement: {x: 0, y: 0},
        dragHappened: false,
      }

      addDragListeners()
    }

    const onMouseDown = (e: MouseEvent) => {
      dragStartHandler(e)
    }

    target.addEventListener('mousedown', onMouseDown as $FixMe)
    target.addEventListener('click', preventUnwantedClick as $FixMe)

    return () => {
      removeDragListeners()
      target.removeEventListener('mousedown', onMouseDown as $FixMe)
      target.removeEventListener('click', preventUnwantedClick as $FixMe)

      if (modeRef.current !== 'notDragging') {
        callbacksRef.current.onDragEnd?.(modeRef.current === 'dragging')
      }
      modeRef.current = 'notDragging'
    }
  }, [target])

  return [mode === 'dragging']
}

/**
 * shouldPointerLock moves the mouse to the center of your screen in firefox, which
 * can cause it to report very large movementX when the pointer lock begins. This
 * function hackily detects unnaturally large movements of the mouse.
 *
 * @param event - MouseEvent from onDrag
 * @returns
 */
function didPointerLockCauseMovement(event: MouseEvent) {
  return Math.abs(event.movementX) > 100 || Math.abs(event.movementY) > 100
}
