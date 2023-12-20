import {Atom} from '@theatre/dataverse'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useCallback, useEffect, useMemo} from 'react'

let lastTooltipId = 0

export const useTooltipOpenState = (): [
  isOpen: boolean,
  setIsOpen: (isOpen: boolean, delay: number) => void,
] => {
  const id = useMemo(() => lastTooltipId++, [])
  const [isOpenRef, isOpen] = useRefAndState<boolean>(false)

  const setIsOpen = useCallback((shouldOpen: boolean, delay: number) => {
    setCurrentTooltipId(shouldOpen ? id : -1, delay)
  }, [])

  useEffect(() => {
    return currentTooltip.onStale(() => {
      const flag = currentTooltip.getValue() === id

      if (isOpenRef.current !== flag) isOpenRef.current = flag
    })
  }, [currentTooltip, id])

  return [isOpen, setIsOpen]
}

const currentTooltipId = new Atom(-1)
let lastTimeout: NodeJS.Timeout | undefined = undefined
const setCurrentTooltipId = (id: number, delay: number) => {
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

const currentTooltip = currentTooltipId.prism

export const closeAllTooltips = () => {
  setCurrentTooltipId(-1, 0)
}
