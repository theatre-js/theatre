import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {MutableRefObject} from 'react'
import {useContext} from 'react'
import {useEffect} from 'react'
import React from 'react'
import TooltipWrapper from './TooltipWrapper'
import {createPortal} from 'react-dom'
import {useTooltipOpenState} from './TooltipContext'
import {PortalContext} from 'reakit'
import noop from '@theatre/shared/utils/noop'

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

    const target = targetRef.current
    if (!target) return

    const onMouseEnter = () => setIsOpen(true, opts.enterDelay ?? 400)
    const onMouseLeave = () => setIsOpen(false, opts.exitDelay ?? 200)

    target.addEventListener('mouseenter', onMouseEnter)
    target.addEventListener('mouseleave', onMouseLeave)

    return () => {
      target.removeEventListener('mouseenter', onMouseEnter)
      target.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [targetRef, enabled, opts.enterDelay, opts.exitDelay])

  const portalLayer = useContext(PortalContext)

  const node =
    enabled && isOpen && targetNode ? (
      createPortal(
        <TooltipWrapper
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
