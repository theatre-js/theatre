import mousePositionD from '@theatre/studio/utils/mousePositionD'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import {createPortal} from 'react-dom'

const ShowMousePosition: React.FC<{}> = (props) => {
  const pos = usePrism(
    () => val(mousePositionD) ?? {clientX: 0, clientY: 0},
    [],
  )
  return createPortal(
    <>
      <div
        style={{
          position: 'fixed',
          top: '0',
          bottom: '0',
          width: '1px',
          background: 'rgba(255, 255, 255, 0.2)',
          pointerEvents: 'none',
          zIndex: 9999,
          left: `${pos.clientX}px`,
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: '0',
          right: '0',
          height: '1px',
          background: 'rgba(255, 255, 255, 0.2)',
          pointerEvents: 'none',
          zIndex: 9999,
          top: `${pos.clientY}px`,
        }}
      />
    </>,
    document.body,
  )
}

export default ShowMousePosition
