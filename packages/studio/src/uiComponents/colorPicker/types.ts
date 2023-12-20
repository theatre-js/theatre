import type React from 'react'

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface RgbaColor extends RgbColor {
  a: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export interface HslaColor extends HslColor {
  a: number
}

export interface HsvColor {
  h: number
  s: number
  v: number
}

export interface HsvaColor extends HsvColor {
  a: number
}

export type ObjectColor =
  | RgbColor
  | HslColor
  | HsvColor
  | RgbaColor
  | HslaColor
  | HsvaColor

export type AnyColor = string | ObjectColor

export interface ColorModel<T extends AnyColor> {
  defaultColor: T
  toHsva: (defaultColor: T) => HsvaColor
  fromHsva: (hsva: HsvaColor) => T
  equal: (first: T, second: T) => boolean
}

type ColorPickerHTMLAttributes = Partial<
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'color' | 'onChange' | 'onChangeCapture'
  >
>

export interface ColorPickerBaseProps<T extends AnyColor>
  extends ColorPickerHTMLAttributes {
  color: T
  temporarilySetValue: (newColor: T) => void
  permanentlySetValue: (newColor: T) => void
  discardTemporaryValue: () => void
}

type ColorInputHTMLAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
>

export interface ColorInputBaseProps extends ColorInputHTMLAttributes {
  color?: string
  onChange?: (newColor: string) => void
}
