import {Box} from '@theatre/dataverse'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'

const ctx = createContext<{
  currentTooltipId: Box<number>
  portalTarget: HTMLElement
}>(null!)

let lastTooltipId = 0

export const useTooltipOpenState = (): [
  isOpen: boolean,
  setIsOpen: (isOpen: boolean, delay: number) => void,
] => {
  const id = useMemo(() => lastTooltipId++, [])
  const {currentTooltipId} = useContext(ctx)
  const [isOpenRef, isOpen] = useRefAndState<boolean>(false)

  const setIsOpen = useCallback((shouldOpen: boolean, delay: number) => {
    if (shouldOpen) {
      if (currentTooltipId.get() !== id) {
        currentTooltipId.set(id)
      }
    } else {
      if (currentTooltipId.get() === id) {
        currentTooltipId.set(-1)
      }
    }
  }, [])

  useEffect(() => {
    const {derivation} = currentTooltipId
    return derivation.changesWithoutValues().tap(() => {
      const flag = derivation.getValue() === id

      if (isOpenRef.current !== flag) isOpenRef.current = flag
    })
  }, [currentTooltipId, id])

  return [isOpen, setIsOpen]
}

const TooltipContext: React.FC<{portalTarget: HTMLElement}> = ({
  children,
  portalTarget,
}) => {
  const currentTooltipId = useMemo(() => new Box(-1), [])

  return (
    <ctx.Provider value={{currentTooltipId, portalTarget}}>
      {children}
    </ctx.Provider>
  )
}

export default TooltipContext
