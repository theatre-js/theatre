import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import transparentize from 'polished/lib/color/transparentize'
import React, {useLayoutEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import useWindowSize from 'react-use/esm/useWindowSize'
import styled from 'styled-components'
import useOnClickOutside from '@theatre/studio/uiComponents/useOnClickOutside'
import PopoverArrow from './PopoverArrow'
import {usePopoverContext} from './PopoverContext'

export const popoverBackgroundColor = transparentize(0.05, `#2a2a31`)
const minimumDistanceOfArrowToEdgeOfPopover = 8

const Container = styled.ul`
  position: absolute;
  z-index: 10000;
  background: ${popoverBackgroundColor};
  color: white;
  padding: 0;
  margin: 0;
  cursor: default;
  ${pointerEventsAutoInNormalMode};
  border-radius: 3px;
`

const Popover: React.FC<{
  target: Element
  children: () => React.ReactNode
  className?: string
}> = (props) => {
  const {pointerDistanceThreshold, onPointerOutOfThreshold} =
    usePopoverContext()

  const [container, setContainer] = useState<HTMLElement | null>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  const containerRect = useBoundingClientRect(container)
  const targetRect = useBoundingClientRect(props.target)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    if (!containerRect || !container || !targetRect) return

    const gap = 8
    const arrow = arrowRef.current!

    let verticalPlacement: 'bottom' | 'top' | 'overlay' = 'bottom'
    let top = 0
    let left = 0
    if (targetRect.bottom + containerRect.height + gap < windowSize.height) {
      verticalPlacement = 'bottom'
      top = targetRect.bottom + gap
      arrow.style.top = '0px'
    } else if (targetRect.top > containerRect.height + gap) {
      verticalPlacement = 'top'
      top = targetRect.top - (containerRect.height + gap)
      arrow.style.bottom = '0px'
      arrow.style.transform = 'rotateZ(180deg)'
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
      arrow.style.left = arrowLeft + 'px'
    }

    const pos = {left, top}

    container.style.left = pos.left + 'px'
    container.style.top = pos.top + 'px'

    const onMouseMove = (e: MouseEvent) => {
      if (
        e.clientX < pos.left - pointerDistanceThreshold ||
        e.clientX > pos.left + containerRect.width + pointerDistanceThreshold ||
        e.clientY < pos.top - pointerDistanceThreshold ||
        e.clientY > pos.top + containerRect.height + pointerDistanceThreshold
      ) {
        onPointerOutOfThreshold()
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [
    containerRect,
    container,
    props.target,
    targetRect,
    windowSize,
    onPointerOutOfThreshold,
  ])

  useOnClickOutside(container, onPointerOutOfThreshold)

  return createPortal(
    <Container ref={setContainer} className={props.className}>
      <PopoverArrow ref={arrowRef} />
      {props.children()}
    </Container>,
    getStudio()!.ui.containerShadow,
  )
}

export default Popover
