import {transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'

const theme = {
  defaultState: {
    color: transparentize(0.95, `#C4C4C4`),
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

const DefaultIcon = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 1px;
  /* border: 1px solid currentColor; */
  background-color: currentColor;
`

const FilledIcon = styled.div`
  width: 5px;
  height: 5px;
  background-color: currentColor;
  border-radius: 1px;
`

const DefaultOrStaticValueIndicator: React.FC<{hasStaticOverride: boolean}> = (
  props,
) => {
  return (
    <Container hasStaticOverride={props.hasStaticOverride}>
      {props.hasStaticOverride ? (
        <FilledIcon title="The default value is overridden" />
      ) : (
        <DefaultIcon title="This is the default value for this prop" />
      )}
    </Container>
  )
}

export default DefaultOrStaticValueIndicator
