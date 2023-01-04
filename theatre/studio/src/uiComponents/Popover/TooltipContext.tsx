import type { Prism} from '@theatre/dataverse';
import {Atom} from '@theatre/dataverse'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'

const ctx = createContext<{
  cur: Prism<number>
  set: (id: number, delay: number) => void
}>(null!)

let lastTooltipId = 0

export const useTooltipOpenState = (): [
  isOpen: boolean,
  setIsOpen: (isOpen: boolean, delay: number) => void,
] => {
  const id = useMemo(() => lastTooltipId++, [])
  const {cur, set} = useContext(ctx)
  const [isOpenRef, isOpen] = useRefAndState<boolean>(false)

  const setIsOpen = useCallback((shouldOpen: boolean, delay: number) => {
    set(shouldOpen ? id : -1, delay)
  }, [])

  useEffect(() => {
    return cur.onStale(() => {
      const flag = cur.getValue() === id

      if (isOpenRef.current !== flag) isOpenRef.current = flag
    })
  }, [cur, id])

  return [isOpen, setIsOpen]
}

const TooltipContext: React.FC<{}> = ({children}) => {
  const currentTooltipId = useMemo(() => new Atom(-1), [])
  const cur = currentTooltipId.prism

  const set = useMemo(() => {
    let lastTimeout: NodeJS.Timeout | undefined = undefined
    return (id: number, delay: number) => {
      const overridingPreviousTimeout = lastTimeout !== undefined
      if (lastTimeout !== undefined) {
        clearTimeout(lastTimeout)
        lastTimeout = undefined
      }
      if (delay === 0 || overridingPreviousTimeout) {
        currentTooltipId.set(id)
      } else {
        lastTimeout = setTimeout(() => {
          currentTooltipId.set(id)
          lastTimeout = undefined
        }, delay)
      }
    }
  }, [])

  return <ctx.Provider value={{cur, set}}>{children}</ctx.Provider>
}

export default TooltipContext
