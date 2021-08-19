import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {MutableRefObject} from 'react'
import {useEffect} from 'react'
import React from 'react'
import TooltipWrapper from './TooltipWrapper'
import getStudio from '@theatre/studio/getStudio'
import {createPortal} from 'react-dom'
import {useTooltipOpenState} from './TooltipContext'

export default function useTooltip(
  opts: {enabled?: boolean; delay?: number},
  render: () => React.ReactElement,
): [
  node: React.ReactNode,
  targetRef: MutableRefObject<HTMLElement | SVGElement | null>,
  isOpen: boolean,
] {
  const enabled = opts.enabled !== false
  const [isOpen, setIsOpen] = useTooltipOpenState()

  const [targetRef, targetNode] = useRefAndState<
    HTMLElement | SVGElement | null
  >(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const target = targetRef.current
    if (!target) return

    const onMouseEnter = () => setIsOpen(true, opts.delay ?? 200)
    const onMouseLeave = () => setIsOpen(false, opts.delay ?? 200)

    target.addEventListener('mouseenter', onMouseEnter)
    target.addEventListener('mouseleave', onMouseLeave)

    return () => {
      target.removeEventListener('mouseenter', onMouseEnter)
      target.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [targetRef, enabled, opts.delay])

  const node =
    enabled && isOpen && targetNode ? (
      createPortal(
        <TooltipWrapper children={render} target={targetNode} />,
        getStudio()!.ui.containerShadow,
      )
    ) : (
      <></>
    )

  return [node, targetRef, isOpen]
}
