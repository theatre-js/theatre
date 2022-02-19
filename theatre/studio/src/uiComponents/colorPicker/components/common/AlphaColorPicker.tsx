import React, {useEffect} from 'react'

import {Hue} from './Hue'
import {Saturation} from './Saturation'
import {Alpha} from './Alpha'

import type {
  ColorModel,
  ColorPickerBaseProps,
  AnyColor,
} from '@theatre/studio/uiComponents/colorPicker/types'
import {useColorManipulation} from '@theatre/studio/uiComponents/colorPicker/hooks/useColorManipulation'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  flex-direction: column;
  width: 200px;
  height: 200px;
  user-select: none;
  cursor: default;
`

interface Props<T extends AnyColor> extends ColorPickerBaseProps<T> {
  colorModel: ColorModel<T>
}

export const AlphaColorPicker = <T extends AnyColor>({
  className,
  colorModel,
  color = colorModel.defaultColor,
  temporarilySetValue,
  permanentlySetValue,
  discardTemporaryValue,
  ...rest
}: Props<T>): JSX.Element => {
  const [tempHsva, updateHsva] = useColorManipulation<T>(
    colorModel,
    color,
    temporarilySetValue,
    permanentlySetValue,
  )

  useEffect(() => {
    return () => {
      discardTemporaryValue()
    }
  }, [])

  return (
    <Container {...rest}>
      <Saturation hsva={tempHsva} onChange={updateHsva} />
      <Hue hue={tempHsva.h} onChange={updateHsva} />
      <Alpha hsva={tempHsva} onChange={updateHsva} />
    </Container>
  )
}
