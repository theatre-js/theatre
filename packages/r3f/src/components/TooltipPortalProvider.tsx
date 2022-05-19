import type {ReactNode} from 'react'
import React, {useState} from 'react'
import {PortalContext} from 'reakit'
import styled from 'styled-components'

const PortalHost = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
`

export interface PortalManagerProps {
  children: ReactNode
}

const TooltipPortalProvider: React.VFC<PortalManagerProps> = ({children}) => {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  return (
    <PortalContext.Provider value={wrapper}>
      {children}
      <PortalHost ref={setWrapper} />
    </PortalContext.Provider>
  )
}

export default TooltipPortalProvider
