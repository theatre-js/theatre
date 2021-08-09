import {transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'

export const theme = {
  defaultState: {
    color: transparentize(0.85, `#C4C4C4`),
  },
  withStaticOverride: {
    color: transparentize(0.85, `#C4C4C4`),
  },
}

const Container = styled.div<{hasStaticOverride: boolean}>`
  width: 16px;
  margin: 0 0px 0 2px;
  display: flex;
  justify-content: center;
  align-items: center;

  color: ${(props) =>
    props.hasStaticOverride
      ? theme.withStaticOverride.color
      : theme.defaultState.color};
`

const Rect = styled.rect`
  fill: currentColor;
`

const Icon = () => (
  <svg
    width="5"
    height="5"
    viewBox="0 0 5 5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Rect width="5" height="5" />
  </svg>
)

const DefaultOrStaticValueIndicator: React.FC<{hasStaticOverride: boolean}> = (
  props,
) => {
  return (
    <Container hasStaticOverride={props.hasStaticOverride}>
      <Icon />
    </Container>
  )
}

export default DefaultOrStaticValueIndicator
