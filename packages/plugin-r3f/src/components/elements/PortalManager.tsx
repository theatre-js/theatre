import type {ReactNode} from 'react'
import React, {useLayoutEffect, useState} from 'react'
import {PortalContext} from 'reakit'

export interface PortalManagerProps {
  children: ReactNode
}

const PortalManager: React.VFC<PortalManagerProps> = ({children}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // force update on initial render
  const [, forceUpdate] = useState(false)
  useLayoutEffect(() => {
    forceUpdate((i) => !i)
  }, [])

  return (
    <PortalContext.Provider value={wrapperRef.current}>
      {children}
      <div ref={wrapperRef} className="relative z-50" />
    </PortalContext.Provider>
  )
}

export default PortalManager
