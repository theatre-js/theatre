import {useLayoutEffect, useRef} from 'react'

const noop = () => {}

function createCursorLock(cursor) {
  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999999;`

  el.style.cursor = cursor
  document.body.appendChild(el)
  const relinquish = () => {
    document.body.removeChild(el)
  }

  return relinquish
}

export default function useDrag(target, opts) {
  const optsRef = useRef(opts)
  optsRef.current = opts

  const modeRef = useRef('notDragging')

  const stateRef = useRef({dragHappened: false, startPos: {x: 0, y: 0}})

  useLayoutEffect(() => {
    if (!target) return

    const getDistances = (event) => {
      const {startPos} = stateRef.current
      return [event.screenX - startPos.x, event.screenY - startPos.y]
    }

    let relinquishCursorLock = noop

    const dragHandler = (event) => {
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
      relinquishCursorLock = noop
    }

    const addDragListeners = () => {
      document.addEventListener('mousemove', dragHandler)
      document.addEventListener('mouseup', dragEndHandler)
    }

    const removeDragListeners = () => {
      document.removeEventListener('mousemove', dragHandler)
      document.removeEventListener('mouseup', dragEndHandler)
    }

    const preventUnwantedClick = (event) => {
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

    const dragStartHandler = (event) => {
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

    const onMouseDown = (e) => {
      dragStartHandler(e)
    }

    target.addEventListener('mousedown', onMouseDown)
    target.addEventListener('click', preventUnwantedClick)

    return () => {
      removeDragListeners()
      target.removeEventListener('mousedown', onMouseDown)
      target.removeEventListener('click', preventUnwantedClick)
      relinquishCursorLock()

      if (modeRef.current !== 'notDragging') {
        optsRef.current.onDragEnd &&
          optsRef.current.onDragEnd(modeRef.current === 'dragging')
      }
      modeRef.current = 'notDragging'
    }
  }, [target])
}
