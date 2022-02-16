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
      <g transform="translate(14.181981, 8.353553) rotate(-315.000000) translate(-14.181981, -8.353553) translate(4.681981, -1.646447)">
        <polygon
          fill="#FFFFFF"
          points="9.7 12.1 5.7 16.2 8.5 19 -7.6751256e-13 19 -7.6751256e-13 10.5 2.9 13.3 6.9 9.3 12.5426407 3.65735931 9.74264069 0.757359313 18.2426407 0.757359313 18.2426407 9.25735931 15.4426407 6.45735931"
        ></polygon>
        <polygon
          fill="#000000"
          points="8.7 11.7 4.3 16.2 6.1 18 1 18 1 12.9 2.9 14.8 7.3 10.3 14.0426407 3.65735931 12.1426407 1.75735931 17.2426407 1.75735931 17.2426407 6.85735931 15.4426407 5.05735931"
        ></polygon>
      </g>
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
