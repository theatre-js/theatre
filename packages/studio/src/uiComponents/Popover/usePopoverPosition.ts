import type React from 'react'
import {useLayoutEffect, useState} from 'react'
import useWindowSize from 'react-use/esm/useWindowSize'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {clamp} from 'lodash-es'

const minimumDistanceOfArrowToEdgeOfPopover = 8

type AbsolutePlacementBoxConstraints = {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

const usePopoverPosition = (props: {
  target: HTMLElement | SVGElement | Element | null | undefined
  verticalPlacement?: 'top' | 'bottom' | 'overlay'
  verticalGap?: number // Has no effect if verticalPlacement === 'overlay'
  constraints?: AbsolutePlacementBoxConstraints
}): [
  containerRef: React.MutableRefObject<HTMLElement | SVGElement | null>,
  position: undefined | {top: number; left: number},
] => {
  const [containerRef, container] = useRefAndState<
    HTMLElement | SVGElement | null
  >(null)

  const containerRect = useBoundingClientRect(container)
  const targetRect = useBoundingClientRect(props.target)
  const windowSize = useWindowSize()
  const [arrowContextValue, setArrowContextValue] = useState<
    Record<string, string>
  >({})

  const [positionRef, position] = useRefAndState<
    undefined | {left: number; top: number}
  >(undefined)

  useLayoutEffect(() => {
    if (!containerRect || !targetRect) {
      positionRef.current = undefined
      return
    }

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

    positionRef.current = pos
  }, [containerRect, props.target, targetRect, windowSize])

  return [containerRef, position]
}

export default usePopoverPosition
