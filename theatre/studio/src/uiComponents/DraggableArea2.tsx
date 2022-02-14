import type {MutableRefObject} from 'react'
import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react'
import styled from 'styled-components'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'

interface IDraggableAreaProps {
  elementRef?: MutableRefObject<HTMLInputElement | null>
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
  onDragStart?: (
    event: React.MouseEvent<HTMLElement | SVGElement>,
  ) => void | false
  onDragEnd?: (dragHappened: boolean) => void
}

const Cursor = styled.span`
  position: fixed;
  transform: translate3d(-50%, -50%, 0);
  width: 30px;
  height: 20px;
  background: red;
`

const DraggableArea: React.FC<IDraggableAreaProps> = ({
  children,
  onDrag,
  onDragStart,
  onDragEnd,
  elementRef,
}) => {
  const portalLayer = useContext(PortalContext)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [fakeCursorPosition, setFakeCursorPosition] = useState({
    top: 0,
    left: 0,
  })

  const onMouseDown = useCallback((event) => {
    const {pageX, pageY, button} = event
    if (button === 0) {
      document.body?.requestPointerLock()
      setIsMouseDown(true)
      setFakeCursorPosition({top: pageY, left: pageX})
      onDragStart?.(event)
    }
  }, [])

  useEffect(() => {
    const onMouseUp = () => {
      document.exitPointerLock()
      setIsMouseDown(false)
      onDragEnd?.(true)
    }

    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleSetCursorPosition = useCallback(
    (movementX, movementY) => {
      const {innerWidth} = window
      const {top, left} = fakeCursorPosition

      const newTop = top + movementY
      let newLeft = left + movementX

      if (newLeft <= 0) {
        newLeft += innerWidth
      } else if (newLeft > innerWidth) {
        newLeft -= innerWidth
      }

      setFakeCursorPosition({
        top: newTop,
        left: newLeft,
      })
    },
    [fakeCursorPosition],
  )

  useEffect(() => {
    const handleDragging = (event: MouseEvent) => {
      const {movementX, movementY} = event
      handleSetCursorPosition(movementX, movementY)
      onDrag(movementX, movementY, event)
    }

    if (isMouseDown) {
      document.addEventListener('mousemove', handleDragging, false)
    } else {
      document.removeEventListener('mousemove', handleDragging)
    }

    return () => {
      document.removeEventListener('mousemove', handleDragging)
    }
  }, [isMouseDown, handleSetCursorPosition, onDrag])

  const childrenWithProps = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {onMouseDown, ref: elementRef})
      }
      return child
    })
  }, [children, onMouseDown])

  return (
    <>
      {childrenWithProps}
      {isMouseDown
        ? createPortal(
            <Cursor
              style={{
                ...fakeCursorPosition,
              }}
            />,
            portalLayer!,
          )
        : null}
    </>
  )
}

export default DraggableArea
