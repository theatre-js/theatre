import React from 'react'

import type {Interaction} from './Interactive'
import {Interactive} from './Interactive'
import {Pointer} from './Pointer'

import {hsvaToHslString} from '@theatre/studio/uiComponents/colorPicker/utils/convert'
import {clamp} from '@theatre/studio/uiComponents/colorPicker/utils/clamp'
import {round} from '@theatre/studio/uiComponents/colorPicker/utils/round'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  height: 24px;

  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
`

const StyledPointer = styled(Pointer)`
  z-index: 2;
`

interface Props {
  className?: string
  hue: number
  onChange: (newHue: {h: number}) => void
}

const HueBase = ({className, hue, onChange}: Props) => {
  const handleMove = (interaction: Interaction) => {
    onChange({h: 360 * interaction.left})
  }

  const handleKey = (offset: Interaction) => {
    // Hue measured in degrees of the color circle ranging from 0 to 360
    onChange({
      h: clamp(hue + offset.left * 360, 0, 360),
    })
  }

  return (
    <Container className={className}>
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Hue"
        aria-valuetext={round(hue)}
      >
        <StyledPointer
          left={hue / 360}
          color={hsvaToHslString({h: hue, s: 100, v: 100, a: 1})}
        />
      </Interactive>
    </Container>
  )
}

export const Hue = React.memo(HueBase)
