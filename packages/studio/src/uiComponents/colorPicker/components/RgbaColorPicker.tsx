import React from 'react'

import {AlphaColorPicker} from './common/AlphaColorPicker'
import type {
  ColorModel,
  ColorPickerBaseProps,
  HsvaColor,
  RgbaColor,
} from '@theatre/studio/uiComponents/colorPicker/types'
import {equalColorObjects} from '@theatre/studio/uiComponents/colorPicker/utils/compare'
import {
  rgbaToHsva,
  hsvaToRgba,
} from '@theatre/studio/uiComponents/colorPicker/utils/convert'
import {EditingProvider} from './EditingProvider'

const normalizeRgba = (rgba: RgbaColor) => {
  return {
    r: rgba.r / 255,
    g: rgba.g / 255,
    b: rgba.b / 255,
    a: rgba.a,
  }
}

const denormalizeRgba = (rgba: RgbaColor) => {
  return {
    r: rgba.r * 255,
    g: rgba.g * 255,
    b: rgba.b * 255,
    a: rgba.a,
  }
}

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: {r: 0, g: 0, b: 0, a: 1},
  toHsva: (rgba: RgbaColor) => rgbaToHsva(denormalizeRgba(rgba)),
  fromHsva: (hsva: HsvaColor) => normalizeRgba(hsvaToRgba(hsva)),
  equal: equalColorObjects,
}

export const RgbaColorPicker = (
  props: ColorPickerBaseProps<RgbaColor>,
): JSX.Element => (
  <EditingProvider>
    <AlphaColorPicker
      {...props}
      permanentlySetValue={(newColor) => {
        props.permanentlySetValue!(newColor)
      }}
      colorModel={colorModel}
    />
  </EditingProvider>
)
