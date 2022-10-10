import React from 'react'
import type {Interaction} from './Interactive'
import {Interactive} from './Interactive'
import {Pointer} from './Pointer'
import type {HsvaColor} from '@theatre/studio/uiComponents/colorPicker/types'
import {hsvaToHslString} from '@theatre/studio/uiComponents/colorPicker/utils/convert'
import {clamp} from '@theatre/studio/uiComponents/colorPicker/utils/clamp'
import {round} from '@theatre/studio/uiComponents/colorPicker/utils/round'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  border-color: transparent; /* Fixes https://github.com/omgovich/react-colorful/issues/139 */
  border-bottom: 12px solid #000;
  border-radius: 2px;
  background-image: linear-gradient(to top, #000, rgba(0, 0, 0, 0)),
    linear-gradient(to right, #fff, rgba(255, 255, 255, 0));

  // Improve elements rendering on light backgrounds
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
`

const StyledPointer = styled(Pointer)`
  z-index: 3;
`

interface Props {
  hsva: HsvaColor
  onChange: (newColor: {s: number; v: number}) => void
}

const SaturationBase = ({hsva, onChange}: Props) => {
  const handleMove = (interaction: Interaction) => {
    onChange({
      s: interaction.left * 100,
      v: 100 - interaction.top * 100,
    })
  }

  const handleKey = (offset: Interaction) => {
    // Saturation and brightness always fit into [0, 100] range
    onChange({
      s: clamp(hsva.s + offset.left * 100, 0, 100),
      v: clamp(hsva.v - offset.top * 100, 0, 100),
    })
  }

  const containerStyle = {
    backgroundColor: hsvaToHslString({h: hsva.h, s: 100, v: 100, a: 1}),
  }

  return (
    <Container style={containerStyle}>
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Color"
        aria-valuetext={`Saturation ${round(hsva.s)}%, Brightness ${round(
          hsva.v,
        )}%`}
      >
        <StyledPointer
          top={1 - hsva.v / 100}
          left={hsva.s / 100}
          color={hsvaToHslString(hsva)}
        />
      </Interactive>
    </Container>
  )
}

export const Saturation = React.memo(SaturationBase)
