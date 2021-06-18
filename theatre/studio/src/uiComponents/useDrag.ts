import {voidFn} from '@theatre/shared/utils'
import type {$FixMe} from '@theatre/shared/utils/types'
import {useLayoutEffect, useRef} from 'react'
import {createCursorLock} from './createCursorLock'

export type UseDragOpts = {
  disabled?: boolean
  dontBlockMouseDown?: boolean
  lockCursorTo?: string
  onDragStart?: (event: MouseEvent) => void | false
  onDragEnd?: (dragHappened: boolean) => void
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
}

export default function useDrag(
  target: HTMLElement | SVGElement | undefined | null,
  opts: UseDragOpts,
) {
  const optsRef = useRef<typeof opts>(opts)
  optsRef.current = opts

  const modeRef =
    useRef<'dragStartCalled' | 'dragging' | 'notDragging'>('notDragging')

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

    let relinquishCursorLock = voidFn

    const dragHandler = (event: MouseEvent) => {
      if (!stateRef.current.dragHappened && optsRef.current.lockCursorTo) {
        relinquishCursorLock = createCursorLock(optsRef.current.lockCursorTo)
      }
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
      relinquishCursorLock()
      relinquishCursorLock = voidFn
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
      relinquishCursorLock()

      if (modeRef.current !== 'notDragging') {
        optsRef.current.onDragEnd &&
          optsRef.current.onDragEnd(modeRef.current === 'dragging')
      }
      modeRef.current = 'notDragging'
    }
  }, [target])
}
