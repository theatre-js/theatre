import type {ILogger} from '@theatre/shared/logger'
import React, {useContext, useMemo} from 'react'

const loggerContext = React.createContext<ILogger>(null!)
export function ProvideLogger(
  props: React.PropsWithChildren<{logger: ILogger}>,
) {
  return (
    <loggerContext.Provider value={props.logger}>
      {props.children}
    </loggerContext.Provider>
  )
}

export function useLogger(name?: string, key?: number | string) {
  const parentLogger = useContext(loggerContext)
  return useMemo(() => {
    if (name) {
      return parentLogger.named(name, key)
    } else {
      return parentLogger
    }
  }, [parentLogger, name, key])
}
