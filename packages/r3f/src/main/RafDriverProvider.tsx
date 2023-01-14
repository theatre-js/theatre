import type {ReactNode} from 'react'
import React, {createContext, useContext, useEffect} from 'react'
import type {IRafDriver} from '@theatre/core'

const ctx = createContext<{rafDriver: IRafDriver}>(undefined!)

export const useCurrentRafDriver = (): IRafDriver | undefined => {
  return useContext(ctx)?.rafDriver
}

const RafDriverProvider: React.FC<{
  driver: IRafDriver
  children: ReactNode
}> = ({driver, children}) => {
  useEffect(() => {
    if (!driver || driver.type !== 'Theatre_RafDriver_PublicAPI') {
      throw new Error(
        `driver in <RafDriverProvider deriver={driver}> has an invalid value`,
      )
    }
  }, [driver])

  return <ctx.Provider value={{rafDriver: driver}}>{children}</ctx.Provider>
}

export default RafDriverProvider
