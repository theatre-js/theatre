import React from 'react'
import {cloneElement, useLayoutEffect, useState} from 'react'
import useWindowSize from 'react-use/esm/useWindowSize'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import ArrowContext from './ArrowContext'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useOnClickOutside from '@theatre/studio/uiComponents/useOnClickOutside'
import onPointerOutside from '@theatre/studio/uiComponents/onPointerOutside'
import noop from '@theatre/shared/utils/noop'
import {clamp} from 'lodash-es'

const minimumDistanceOfArrowToEdgeOfPopover = 8

export type AbsolutePlacementBoxConstraints = {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

const TooltipWrapper: React.FC<{
  target: HTMLElement | SVGElement
  onClickOutside?: (e: MouseEvent) => void
  children: () => React.ReactElement
  onPointerOutside?: {
    threshold: number
    callback: (e: MouseEvent) => void
  }
  verticalPlacement?: 'top' | 'bottom' | 'overlay'
  verticalGap?: number // Has no effect if verticalPlacement === 'overlay'
  constraints?: AbsolutePlacementBoxConstraints
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

    const gap = props.verticalGap ?? 8
    const arrowStyle: Record<string, string> = {}

    let verticalPlacement: 'bottom' | 'top' | 'overlay' =
      props.verticalPlacement ?? 'bottom'
    let top = 0
    let left = 0
    if (verticalPlacement === 'bottom') {
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
    } else if (verticalPlacement === 'top') {
      if (targetRect.top > containerRect.height + gap) {
        verticalPlacement = 'top'
        top = targetRect.top - (containerRect.height + gap)
        arrowStyle.bottom = '0px'
        arrowStyle.transform = 'rotateZ(180deg)'
      } else if (
        targetRect.bottom + containerRect.height + gap <
        windowSize.height
      ) {
        verticalPlacement = 'bottom'
        top = targetRect.bottom + gap
        arrowStyle.top = '0px'
      } else {
        verticalPlacement = 'overlay'
      }
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

    const {
      minX = -Infinity,
      maxX = Infinity,
      minY = -Infinity,
      maxY = Infinity,
    } = props.constraints ?? {}
    const pos = {
      left: clamp(left, minX, maxX - containerRect.width),
      top: clamp(top, minY, maxY + containerRect.height),
    }

    container.style.left = pos.left + 'px'
    container.style.top = pos.top + 'px'
    setArrowContextValue(arrowStyle)

    if (props.onPointerOutside) {
      return onPointerOutside(
        container,
        props.onPointerOutside.threshold,
        props.onPointerOutside.callback,
      )
    }
  }, [
    containerRect,
    container,
    props.target,
    targetRect,
    windowSize,
    props.onPointerOutside,
  ])

  useOnClickOutside(container, props.onClickOutside ?? noop)

  return (
    <ArrowContext.Provider value={arrowContextValue}>
      {cloneElement(originalElement, {ref, style})}
    </ArrowContext.Provider>
  )
}

export default TooltipWrapper
