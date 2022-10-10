import type {FC, ReactNode} from 'react'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const dragDetectorContext = createContext(false)

interface DragDetectorProviderProps {
  children: ReactNode
}

export const DragDetectorProvider: FC<DragDetectorProviderProps> = ({
  children,
}) => {
  const mouseDownRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    document.addEventListener('mousedown', () => (mouseDownRef.current = true))
    document.addEventListener('mousemove', () => {
      if (mouseDownRef.current) {
        setDragging(true)
      }
    })
    document.addEventListener('mouseup', () => {
      mouseDownRef.current = false
      setDragging(false)
    })
  }, [])

  return (
    <dragDetectorContext.Provider value={dragging}>
      {children}
    </dragDetectorContext.Provider>
  )
}

export const useDragDetector = () => useContext(dragDetectorContext)
