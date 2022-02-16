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
  lockCursorTo?: 'ew-resize' | 'e-resize' | 'w-resize'
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
  onDragStart?: (
    event: React.MouseEvent<HTMLElement | SVGElement>,
  ) => void | false
  onDragEnd?: (dragHappened: boolean) => void
  enabled?: boolean
}

const Icons = {
  'ew-resize': () => (
    <svg
      width="26"
      height="16"
      viewBox="0 0 26 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8385 9.97992L6.11091 10.0506V14.0104L0.100505 8.00002L6.11091 1.98961L6.18162 6.02012H11.8385H19.8184L19.8891 1.98961L25.8995 8.00002L19.8891 14.0104L19.8891 10.0506L11.8385 9.97992Z"
        fill="white"
      />
      <path
        d="M11.4142 8.98994L5.12096 9.06065L5.12096 11.6062L1.51472 7.99999L5.12096 4.39375L5.12096 7.08075L11.4142 7.01004L20.879 7.08075L20.879 4.39375L24.4853 7.99999L20.879 11.6062L20.879 9.06065L11.4142 8.98994Z"
        fill="black"
      />
    </svg>
  ),
  'e-resize': () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 10.8794L2.5 6.91959L11.7179 6.91964L11.7886 2.88913L17.799 8.89954L11.7886 14.91L11.7886 10.9502L2.5 10.8794Z"
        fill="white"
      />
      <path
        d="M3.3137 9.88948V7.90958L12.7785 7.98029L12.7785 5.29328L16.3848 8.89953L12.7785 12.5058L12.7785 9.96019L3.3137 9.88948Z"
        fill="black"
      />
    </svg>
  ),
  'w-resize': () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.8191 6.91963L15.8191 10.8794L6.60122 10.8794L6.53051 14.9099L0.520101 8.89947L6.53051 2.88906L6.53051 6.84886L15.8191 6.91963Z"
        fill="white"
      />
      <path
        d="M15.0054 7.90954L15.0054 9.88943L5.54056 9.81872L5.54056 12.5057L1.93432 8.89948L5.54056 5.29324L5.54056 7.83882L15.0054 7.90954Z"
        fill="black"
      />
    </svg>
  ),
}

const Cursor = styled.span`
  position: fixed;
  transform: translate3d(-50%, -50%, 0);
`

const DraggableArea: React.FC<IDraggableAreaProps> = ({
  children,
  onDrag,
  onDragStart,
  onDragEnd,
  lockCursorTo = 'ew-resize',
  enabled,
}) => {
  const [hasDragged, setHasDragged] = useState(false)
  const portalLayer = useContext(PortalContext)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [fakeCursorPosition, setFakeCursorPosition] = useState({
    top: 0,
    left: 0,
  })

  const onMouseDown = useCallback(
    (event) => {
      const {pageX, pageY, button} = event
      if (button === 0) {
        document.body?.requestPointerLock()
        setIsMouseDown(true)
        setFakeCursorPosition({top: pageY, left: pageX})
        onDragStart?.(event)
      }
    },
    [onDragStart],
  )

  useEffect(() => {
    const onMouseUp = () => {
      document.exitPointerLock()
      setIsMouseDown(false)
      onDragEnd?.(hasDragged)
      setHasDragged(false)
    }

    if (isMouseDown) {
      document.addEventListener('mouseup', onMouseUp)
    } else {
      document.removeEventListener('mouseup', onMouseUp)
    }

    return () => {
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isMouseDown, onDragEnd, hasDragged])

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
      setHasDragged(true)
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
    const shouldRegisterEvents = enabled !== false

    if (shouldRegisterEvents) {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {onMouseDown})
        }
        return child
      })
    }

    return children
  }, [children, onMouseDown, enabled])

  return (
    <>
      {childrenWithProps}
      {isMouseDown
        ? createPortal(
            <Cursor
              style={{
                ...fakeCursorPosition,
              }}
            >
              {Icons[lockCursorTo]()}
            </Cursor>,
            portalLayer!,
          )
        : null}
    </>
  )
}

export default DraggableArea
