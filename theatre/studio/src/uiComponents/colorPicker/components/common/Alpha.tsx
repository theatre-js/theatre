import React from 'react'

import type {Interaction} from './Interactive'
import {Interactive} from './Interactive'
import {Pointer} from './Pointer'

import {hsvaToHslaString} from '@theatre/studio/uiComponents/colorPicker/utils/convert'
import {clamp} from '@theatre/studio/uiComponents/colorPicker/utils/clamp'
import {round} from '@theatre/studio/uiComponents/colorPicker/utils/round'
import type {HsvaColor} from '@theatre/studio/uiComponents/colorPicker/types'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  height: 16px;
  border-radius: 2px;
  // Checkerboard
  background-color: #fff;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>');
`

interface GradientProps {
  colorFrom: string
  colorTo: string
}

const Gradient = styled.div.attrs<GradientProps>(({colorFrom, colorTo}) => ({
  style: {
    backgroundImage: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
  },
}))<GradientProps>`
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;

  // Improve rendering on light backgrounds
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
`

const StyledPointer = styled(Pointer)`
  // Checkerboard
  background-color: #fff;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>');
`

interface Props {
  className?: string
  hsva: HsvaColor
  onChange: (newAlpha: {a: number}) => void
}

export const Alpha = ({className, hsva, onChange}: Props): JSX.Element => {
  const handleMove = (interaction: Interaction) => {
    onChange({a: interaction.left})
  }

  const handleKey = (offset: Interaction) => {
    // Alpha always fit into [0, 1] range
    onChange({a: clamp(hsva.a + offset.left)})
  }

  // We use `Object.assign` instead of the spread operator
  // to prevent adding the polyfill (about 150 bytes gzipped)
  const colorFrom = hsvaToHslaString(Object.assign({}, hsva, {a: 0}))
  const colorTo = hsvaToHslaString(Object.assign({}, hsva, {a: 1}))

  return (
    <Container className={className}>
      <Gradient colorFrom={colorFrom} colorTo={colorTo} />
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Alpha"
        aria-valuetext={`${round(hsva.a * 100)}%`}
      >
        <StyledPointer left={hsva.a} color={hsvaToHslaString(hsva)} />
      </Interactive>
    </Container>
  )
}
