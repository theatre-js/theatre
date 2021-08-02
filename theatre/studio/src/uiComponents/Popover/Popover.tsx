import getStudio from '@theatre/studio/getStudio'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import transparentize from 'polished/lib/color/transparentize'
import React, {useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import useWindowSize from 'react-use/esm/useWindowSize'
import styled from 'styled-components'

/**
 * How far from the menu should the pointer travel to auto close the menu
 */
const defaultPointerDistanceThreshold = 200

const Container = styled.ul`
  position: absolute;
  z-index: 10000;
  background: ${transparentize(0.2, '#111')};
  color: white;
  padding: 0;
  margin: 0;
  cursor: default;
  pointer-events: all;
  border-radius: 3px;
`

const Popover: React.FC<{
  clickPoint: {clientX: number; clientY: number}
  target: HTMLElement
  onRequestClose: () => void
  children: () => React.ReactNode
  pointerDistanceThreshold?: number
}> = (props) => {
  const pointerDistanceThreshold =
    props.pointerDistanceThreshold ?? defaultPointerDistanceThreshold

  const [container, setContainer] = useState<HTMLElement | null>(null)
  const rect = useBoundingClientRect(container)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    if (!rect || !container) return

    const preferredAnchorPoint = {
      left: rect.width / 2,
      top: 0,
    }

    const pos = {
      left: props.clickPoint.clientX - preferredAnchorPoint.left,
      top: props.clickPoint.clientY - preferredAnchorPoint.top,
    }

    if (pos.left < 0) {
      pos.left = 0
    } else if (pos.left + rect.width > windowSize.width) {
      pos.left = windowSize.width - rect.width
    }

    if (pos.top < 0) {
      pos.top = 0
    } else if (pos.top + rect.height > windowSize.height) {
      pos.top = windowSize.height - rect.height
    }

    container.style.left = pos.left + 'px'
    container.style.top = pos.top + 'px'

    const onMouseMove = (e: MouseEvent) => {
      if (
        e.clientX < pos.left - pointerDistanceThreshold ||
        e.clientX > pos.left + rect.width + pointerDistanceThreshold ||
        e.clientY < pos.top - pointerDistanceThreshold ||
        e.clientY > pos.top + rect.height + pointerDistanceThreshold
      ) {
        props.onRequestClose()
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      if (!e.composedPath().includes(container)) {
        props.onRequestClose()
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown, {capture: true})

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown, {capture: true})
    }
  }, [rect, container, props.clickPoint, windowSize, props.onRequestClose])

  return createPortal(
    <Container ref={setContainer}>{props.children()}</Container>,
    getStudio()!.ui.containerShadow,
  )
}

export default Popover
