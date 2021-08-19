import React from 'react'
import {cloneElement, useLayoutEffect, useState} from 'react'
import useWindowSize from 'react-use/esm/useWindowSize'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import ArrowContext from './ArrowContext'
import useRefAndState from '@theatre/studio/utils/useRefAndState'

const minimumDistanceOfArrowToEdgeOfPopover = 8

const TooltipWrapper: React.FC<{
  target: HTMLElement | SVGElement
  children: () => React.ReactElement
}> = (props) => {
  const originalElement = props.children()
  const [ref, container] = useRefAndState<HTMLElement | SVGElement | null>(null)
  const style: Record<string, string> = originalElement.props.style
    ? {...originalElement.props.style}
    : {}
  style.position = 'absolute'

  const containerRect = useBoundingClientRect(container)
  const targetRect = useBoundingClientRect(props.target)
  const windowSize = useWindowSize()
  const [arrowContextValue, setArrowContextValue] = useState<
    Record<string, string>
  >({})

  useLayoutEffect(() => {
    if (!containerRect || !container || !targetRect) return

    const gap = 8
    const arrowStyle: Record<string, string> = {}

    let verticalPlacement: 'bottom' | 'top' | 'overlay' = 'bottom'
    let top = 0
    let left = 0
    if (targetRect.bottom + containerRect.height + gap < windowSize.height) {
      verticalPlacement = 'bottom'
      top = targetRect.bottom + gap
      arrowStyle.top = '0px'
    } else if (targetRect.top > containerRect.height + gap) {
      verticalPlacement = 'top'
      top = targetRect.top - (containerRect.height + gap)
      arrowStyle.bottom = '0px'
      arrowStyle.transform = 'rotateZ(180deg)'
    } else {
      verticalPlacement = 'overlay'
    }

    let arrowLeft = 0
    if (verticalPlacement !== 'overlay') {
      const anchorLeft = targetRect.left + targetRect.width / 2
      if (anchorLeft < containerRect.width / 2) {
        left = gap
        arrowLeft = Math.max(
          anchorLeft - gap,
          minimumDistanceOfArrowToEdgeOfPopover,
        )
      } else if (anchorLeft + containerRect.width / 2 > windowSize.width) {
        left = windowSize.width - (gap + containerRect.width)
        arrowLeft = Math.min(
          anchorLeft - left,
          containerRect.width - minimumDistanceOfArrowToEdgeOfPopover,
        )
      } else {
        left = anchorLeft - containerRect.width / 2
        arrowLeft = containerRect.width / 2
      }
      arrowStyle.left = arrowLeft + 'px'
    }

    const pos = {left, top}

    container.style.left = pos.left + 'px'
    container.style.top = pos.top + 'px'
    setArrowContextValue(arrowStyle)

    return () => {}
  }, [containerRect, container, props.target, targetRect, windowSize])

  return (
    <ArrowContext.Provider value={arrowContextValue}>
      {cloneElement(originalElement, {ref, style})}
    </ArrowContext.Provider>
  )
}

export default TooltipWrapper
