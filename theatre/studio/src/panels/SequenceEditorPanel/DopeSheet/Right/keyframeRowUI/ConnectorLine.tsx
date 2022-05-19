import {lighten} from 'polished'
import React from 'react'
import styled from 'styled-components'
import {DOT_SIZE_PX} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/SingleKeyframeDot'

const CONNECTOR_HEIGHT = DOT_SIZE_PX / 2 + 1
const CONNECTOR_WIDTH_UNSCALED = 1000

export type IConnectorThemeValues = {
  isPopoverOpen: boolean
  isSelected: boolean
}

export const CONNECTOR_THEME = {
  normalColor: `#365b59`, // (greenish-blueish)ish
  popoverOpenColor: `#817720`, // orangey yellowish
  barColor: (values: IConnectorThemeValues) => {
    const base = values.isPopoverOpen
      ? CONNECTOR_THEME.popoverOpenColor
      : CONNECTOR_THEME.normalColor
    return values.isSelected ? lighten(0.2, base) : base
  },
  hoverColor: (values: IConnectorThemeValues) => {
    const base = values.isPopoverOpen
      ? CONNECTOR_THEME.popoverOpenColor
      : CONNECTOR_THEME.normalColor
    return values.isSelected ? lighten(0.4, base) : lighten(0.1, base)
  },
}

const Container = styled.div<IConnectorThemeValues>`
  position: absolute;
  background: ${CONNECTOR_THEME.barColor};
  height: ${CONNECTOR_HEIGHT}px;
  width: ${CONNECTOR_WIDTH_UNSCALED}px;

  left: 0;
  top: -${CONNECTOR_HEIGHT / 2}px;
  transform-origin: top left;
  z-index: 0;
  cursor: ew-resize;

  &:after {
    display: block;
    position: absolute;
    content: ' ';
    top: -4px;
    bottom: -4px;
    left: 0;
    right: 0;
  }

  &:hover {
    background: ${CONNECTOR_THEME.hoverColor};
  }
`

type IConnectorLineProps = React.PropsWithChildren<{
  isPopoverOpen: boolean
  openPopover?: (event: React.MouseEvent) => void
  isSelected: boolean
  connectorLengthInUnitSpace: number
}>

export const ConnectorLine = React.forwardRef<
  HTMLDivElement,
  IConnectorLineProps
>((props, ref) => {
  const themeValues: IConnectorThemeValues = {
    isPopoverOpen: props.isPopoverOpen,
    isSelected: props.isSelected,
  }

  return (
    <Container
      {...themeValues}
      ref={ref}
      style={{
        // Previously we used scale3d, which had weird fuzzy rendering look in both FF & Chrome
        transform: `scaleX(calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          props.connectorLengthInUnitSpace / CONNECTOR_WIDTH_UNSCALED
        }))`,
      }}
      onClick={(e) => {
        props.openPopover?.(e)
      }}
    >
      {props.children}
    </Container>
  )
})
