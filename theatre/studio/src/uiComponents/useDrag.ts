import type {$FixMe} from '@theatre/shared/utils/types'
import {useLayoutEffect, useRef} from 'react'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useCursorLock} from './PointerEventsHandler'

export type UseDragOpts = {
  /**
   * Setting it to true will disable the listeners.
   */
  disabled?: boolean
  /**
   * Setting it to true will allow the mouse down events to propagate up
   */
  dontBlockMouseDown?: boolean
  /**
   * The css cursor property during the gesture will be locked to this value
   */
  lockCursorTo?: string
  /**
   * Called at the start of the gesture. Mind you, that this would be called, even
   * if the user is just clicking (and not dragging). However, if the gesture turns
   * out to be a click, then onDragEnd(false) will be called. Otherwise,
   * a series of `onDrag(dx, dy, event)` events will be called, and the
   * gesture will end with `onDragEnd(true)`.
   */
  onDragStart?: (event: MouseEvent) => void | false
  /**
   * Called at the end of the drag gesture.
   * `dragHappened` will be `true` if the user actually moved the pointer
   * (if onDrag isn't called, then this will be false becuase the user hasn't moved the pointer)
   */
  onDragEnd?: (dragHappened: boolean) => void
  /**
   * This will be called 0 times if the gesture ends up being a click,
   * or 1 or more times if it ends up being a drag gesture.
   *
   * `dx`: the delta x
   * `dy`: the delta y
   * `event`: the mouse event
   */
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
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

  useCursorLock(
    mode === 'dragging' && typeof opts.lockCursorTo === 'string',
    'dragging',
    opts.lockCursorTo!,
  )

  const stateRef = useRef<{
    dragHappened: boolean
    startPos: {
      x: number
      y: number
    }
  }>({dragHappened: false, startPos: {x: 0, y: 0}})

  useLayoutEffect(() => {
    if (!target) return

    const getDistances = (event: MouseEvent): [number, number] => {
      const {startPos} = stateRef.current
      return [event.screenX - startPos.x, event.screenY - startPos.y]
    }

    const dragHandler = (event: MouseEvent) => {
      if (!stateRef.current.dragHappened) stateRef.current.dragHappened = true
      modeRef.current = 'dragging'

      const deltas = getDistances(event)
      optsRef.current.onDrag(deltas[0], deltas[1], event)
    }

    const dragEndHandler = () => {
      removeDragListeners()
      modeRef.current = 'notDragging'

      optsRef.current.onDragEnd &&
        optsRef.current.onDragEnd(stateRef.current.dragHappened)
    }

    const addDragListeners = () => {
      document.addEventListener('mousemove', dragHandler)
      document.addEventListener('mouseup', dragEndHandler)
    }

    const removeDragListeners = () => {
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
      const opts = optsRef.current
      if (opts.disabled === true) return

      if (event.button !== 0) return
      const resultOfStart = opts.onDragStart && opts.onDragStart(event)

      if (resultOfStart === false) return

      if (!opts.dontBlockMouseDown) {
        event.stopPropagation()
        event.preventDefault()
      }

      modeRef.current = 'dragStartCalled'

      const {screenX, screenY} = event
      stateRef.current.startPos = {x: screenX, y: screenY}
      stateRef.current.dragHappened = false

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
        optsRef.current.onDragEnd &&
          optsRef.current.onDragEnd(modeRef.current === 'dragging')
      }
      modeRef.current = 'notDragging'
    }
  }, [target])

  return [mode === 'dragging']
}
