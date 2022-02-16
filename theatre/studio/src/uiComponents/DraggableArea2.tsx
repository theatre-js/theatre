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
  onDrag: (dx: number, dy: number, event: MouseEvent) => void
  onDragStart?: (
    event: React.MouseEvent<HTMLElement | SVGElement>,
  ) => void | false
  onDragEnd?: (dragHappened: boolean) => void
}

namespace Icons {
  export const EWResize = () => (
    <svg
      width="27px"
      height="16px"
      viewBox="0 0 27 16"
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
  )
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
}) => {
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
      onDragEnd?.(true)
    }

    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onDragEnd])

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
        return React.cloneElement(child, {onMouseDown})
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
            >
              <Icons.EWResize />
            </Cursor>,
            portalLayer!,
          )
        : null}
    </>
  )
}

export default DraggableArea
