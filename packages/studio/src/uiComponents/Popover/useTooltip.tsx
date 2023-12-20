import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {MutableRefObject} from 'react'
import {useContext} from 'react'
import React from 'react'
import PopoverPositioner from './PopoverPositioner'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'
import noop from '@theatre/utils/noop'
import type {$IntentionalAny} from '@theatre/core/types/public'
import {Atom} from '@theatre/dataverse'
import {useCallback, useEffect, useMemo} from 'react'

/**
 * Useful helper in development to prevent the tooltips from auto-closing,
 * so its easier to inspect the DOM / change the styles, etc.
 *
 * Call window.$disableAutoCloseTooltip() in the console to disable auto-close
 */
const shouldAutoCloseByDefault =
  process.env.NODE_ENV === 'development'
    ? (): boolean =>
        (window as $IntentionalAny).__disableAutoCloseTooltip ?? true
    : (): boolean => true

if (process.env.NODE_ENV === 'development') {
  ;(window as $IntentionalAny).$disableAutoCloseTooltip = () => {
    ;(window as $IntentionalAny).__disableAutoCloseTooltip = false
  }
}

export default function useTooltip<T extends HTMLElement>(
  opts: {
    enabled?: boolean
    enterDelay?: number
    exitDelay?: number
    verticalPlacement?: 'top' | 'bottom' | 'overlay'
    verticalGap?: number
  },
  render: () => React.ReactElement,
): [
  node: React.ReactNode,
  targetRef: MutableRefObject<T | null>,
  isOpen: boolean,
] {
  const enabled = opts.enabled !== false
  const [isOpen, setIsOpen] = useTooltipOpenState()

  const [targetRef, targetNode] = useRefAndState<T | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const target = targetNode
    if (!target) return

    const onMouseEnter = () => setIsOpen(true, opts.enterDelay ?? 800)
    const onMouseLeave = () => {
      if (shouldAutoCloseByDefault()) setIsOpen(false, opts.exitDelay ?? 200)
    }

    target.addEventListener('mouseenter', onMouseEnter)
    target.addEventListener('mouseleave', onMouseLeave)

    return () => {
      target.removeEventListener('mouseenter', onMouseEnter)
      target.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [targetNode, enabled, opts.enterDelay, opts.exitDelay])

  const portalLayer = useContext(PortalContext)

  const node =
    enabled && isOpen && targetNode ? (
      createPortal(
        <PopoverPositioner
          children={render}
          target={targetNode}
          onClickOutside={noop}
          verticalPlacement={opts.verticalPlacement}
          verticalGap={opts.verticalGap}
        />,
        portalLayer!,
      )
    ) : (
      <></>
    )

  return [node, targetRef, isOpen]
}

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
