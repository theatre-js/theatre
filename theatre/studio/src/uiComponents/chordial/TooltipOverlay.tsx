import type {ReactNode} from 'react'
import React from 'react'
import type {$IntentionalAny} from '@theatre/utils/types'
import {val} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import styled from 'styled-components'
import usePopoverPosition from '@theatre/studio/uiComponents/Popover/usePopoverPosition'
import {useTransition, animated, easings} from '@react-spring/web'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {tooltipTarget} from './chordialInternals'

export const TooltipOverlay: React.FC<{}> = () => {
  const currentTarget = useVal(tooltipTarget)

  const title = usePrism((): ReactNode => {
    const chordial = currentTarget
    if (!chordial) return null
    const a = chordial.atom
    const optsFn = val(a.pointer.optsFn)
    const opts = optsFn()
    return opts.title
  }, [currentTarget])

  const [popoverContainerRef, positioning] = usePopoverPosition({
    target: currentTarget?.target,
  })

  const data: Array<{
    key: string
    title: ReactNode
    positioning: {left: number; top: number}
  }> = []

  const chordial = currentTarget
  if (chordial && positioning) {
    data.push({
      key: chordial.id,
      title,
      positioning,
    })
  }

  const transitions = useTransition(data, {
    from: {
      opacity: 0.5,
      transform: `translateY(-10px) perspective(200px) scale(0.95) rotateX(-90deg) `,
    },
    enter: {
      opacity: 1,
      transform: `translateY(0px) perspective(200px) scale(1) rotateX(0deg) `,
    },
    leave: {
      opacity: 0,
      transform: `translateY(0px) perspective(200px) scale(0.9) rotateX(-10deg) `,
    },
    keys: (item) => item.key,
    config: (item, index, phase) => (key) => {
      return {
        // velocity: phase === 'leave' ? 0.5 : 6,
        duration: phase === 'leave' ? 66 : 33 * 4,
        easing: easings.easeOutCubic,
      }
    },
  })

  return (
    <>
      {title && (
        <Container
          ref={popoverContainerRef as React.MutableRefObject<$IntentionalAny>}
          style={{opacity: 0}}
        >
          <Title>{title}</Title>
          <IconContainer>{theIcon}</IconContainer>
          {title}
        </Container>
      )}

      {transitions((style, item) => {
        return (
          <Container
            style={{
              ...style,
              left: item.positioning.left + 'px',
              top: item.positioning.top + 'px',
              willChange: 'transform, opacity',
            }}
          >
            <Title>{item.title}</Title>
            <IconContainer>{theIcon}</IconContainer>
          </Container>
        )
      })}
    </>
  )
}

const theIcon = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="0.8em"
    width="0.8em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 4 7.07 17 2.51-7.39L21 11.07z"></path>
  </svg>
)

const Container = styled(animated.div)`
  display: flex;
  align-items: center;
  height: 30px;
  position: relative;
  position: absolute;
  transform-origin: top center;

  cursor: default;
  ${pointerEventsAutoInNormalMode};

  color: white;
  box-sizing: border-box;

  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 25%) 0px 2px 4px;
  backdrop-filter: blur(8px) saturate(300%) contrast(65%) brightness(55%);
  background-color: rgb(45 46 66 / 50%);
  border: 0.5px solid rgb(86 100 110 / 46%);
  z-index: 10000;
  padding: 8px 8px;
  font-size: 10px;

  z-index: 10000;

  & a {
    color: inherit;
  }

  max-width: 240px;
  padding: 8px;
  pointer-events: none !important;
`

const Title = styled.div`
  text-wrap: nowrap;
`

const IconContainer = styled.div`
  background: #59595938;
  border-radius: 4px;
  border: 0.5px solid #ffffff1a;
  color: white;
  padding: 4px;
  font-size: 10px;
  /* margin: 0; */
  margin-left: 12px;
  box-shadow: black 0px 2px 8px -4px;
  flex-wrap: nowrap;
`
