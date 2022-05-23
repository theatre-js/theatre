import type {Context, ReactNode} from 'react'
import React, {useState} from 'react'
import styled from 'styled-components'

const PortalHost = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`

export interface PortalManagerProps {
  portalContext: Context<HTMLElement | null>
  children: ReactNode
}

const PortalProvider: React.VFC<PortalManagerProps> = ({
  children,
  portalContext,
}) => {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  return (
    <portalContext.Provider value={wrapper}>
      {children}
      <PortalHost ref={setWrapper} data-portal />
    </portalContext.Provider>
  )
}

export default PortalProvider
