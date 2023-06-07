import {transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'
import getStudio from '@theatre/studio/getStudio'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PropTypeConfig} from '@theatre/core/propTypes'
import {nextPrevCursorsTheme} from './NextPrevKeyframeCursors'

const theme = {
  defaultState: {
    color: transparentize(0.95, `#C4C4C4`),
    hoverColor: transparentize(0.15, nextPrevCursorsTheme.onColor),
  },
  withStaticOverride: {
    color: transparentize(0.85, `#C4C4C4`),
    hoverColor: transparentize(0.15, nextPrevCursorsTheme.onColor),
  },
}

const Container = styled.div<{hasStaticOverride: boolean}>`
  width: 16px;
  margin: 0 0px 0 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  color: ${(props) =>
    props.hasStaticOverride
      ? theme.withStaticOverride.color
      : theme.defaultState.color};

  &:hover {
    color: ${(props) =>
      props.hasStaticOverride
        ? theme.withStaticOverride.hoverColor
        : theme.defaultState.hoverColor};
  }
`

const DefaultIcon = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 1px;
  transform: rotate(45deg);
  /* border: 1px solid currentColor; */
  background-color: currentColor;
`

const FilledIcon = styled.div`
  width: 5px;
  height: 5px;
  background-color: currentColor;
  border-radius: 1px;
  transform: rotate(45deg);
`

const DefaultOrStaticValueIndicator: React.FC<{
  hasStaticOverride: boolean
  pathToProp: PathToProp
  obj: SheetObject
  propConfig: PropTypeConfig
}> = (props) => {
  const {hasStaticOverride, obj, propConfig, pathToProp} = props
  const sequenceCb = () => {
    getStudio()!.transaction(({stateEditors}) => {
      const propAddress = {...obj.address, pathToProp}

      stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsSequenced(
        propAddress,
        propConfig,
      )
    })
  }
  return (
    <Container
      hasStaticOverride={hasStaticOverride}
      onClick={sequenceCb}
      title="Sequence this prop"
    >
      {hasStaticOverride ? (
        <FilledIcon title="The default value is overridden" />
      ) : (
        <DefaultIcon title="This is the default value for this prop" />
      )}
    </Container>
  )
}

export default DefaultOrStaticValueIndicator
