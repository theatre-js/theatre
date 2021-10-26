type ColorSpace = 'rgb' | 'hsl' | 'hwb'

interface inputConfig {
  color: string
  useDegrees: boolean
  usePercentage: boolean
  useDivision: boolean
  useComma: boolean
  isHex: boolean
}

interface ColorObject {
  colorSpace: ColorSpace
  value: number[]
  config?: inputConfig
}

function parseConfig(color: string): inputConfig {
  return {
    color: color.replace('360', '0').replace('0.', '.'),
    useDegrees: color.includes('deg'),
    usePercentage: color.includes('%'),
    useDivision: color.includes('/'),
    useComma: color.includes(','),
    isHex: color.includes('#'),
  }
}

function parseCylindrical(
  colorSpace: ColorSpace,
  prefix: string = colorSpace,
  color: string,
): ColorObject | undefined {
  var match = color.match(
    new RegExp(
      `^${prefix}\\(\\s*([+-]?(?:\\d{0,3}\\.)?\\d+)(?:deg)?\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*(?:[,|\\\\/]\\s*([+-]?[\\d\\.]+)\\s*)?\\)$`,
    ),
  )
  if (match) {
    var alpha = parseFloat(match[4])
    return {
      colorSpace,
      value: [
        (parseFloat(match[1]) + 360) % 360,
        clamp(parseFloat(match[2]), 0, 100),
        clamp(parseFloat(match[3]), 0, 100),
        clamp(isNaN(alpha) ? 1 : alpha, 0, 1),
      ],
    }
  }
  return undefined
}

function parseRGB(color: string): ColorObject | undefined {
  const rgbArray = getRGBArray(color)?.map((v, i) => {
    const rounded =
      i === 3 ? Math.round((v + Number.EPSILON) * 1000) / 1000 : Math.round(v)
    return isNaN(rounded) ? 1 : clamp(rounded, 0, i == 3 ? 1 : 255)
  })
  return rgbArray ? {colorSpace: 'rgb', value: rgbArray} : undefined
}

function getRGBArray(rgb: string) {
  let value = [0, 1, 2, 3],
    match: RegExpMatchArray | null | string
  if ((match = rgb.match(/^#([a-f0-9]{6})([a-f0-9]{2})?$/i))) {
    value = value.map((i) => parseInt(match![1].slice(i + i, i + i + 2), 16))
    if (match[2]) value[3] = parseInt(match[2], 16) / 255
    return value
  }
  if ((match = rgb.match(/^#([a-f0-9]{3,4})$/i))) {
    return value.map(
      (i) => parseInt(match![1][i] + match![1][i], 16) / (i == 3 ? 255 : 1),
    )
  }
  if (
    (match = rgb.match(
      /^rgba?\(\s*([+-]?(?:\d{0,3}\.)?\d+)\s*,?\s*([+-]?[\d\.]+)\s*,?\s*([+-]?[\d\.]+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)\s*)?\)$/,
    ))
  ) {
    return value.map((i) => parseFloat(match![i + 1]))
  }
  if (
    (match = rgb.match(
      /^rgba?\(\s*([+-]?(?:\d{0,3}\.)?\d+)%\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?[\d\.]+)\s*)?\)$/,
    ))
  ) {
    return value.map((i) => parseFloat(match![i + 1]) * (i == 3 ? 1 : 2.55))
  }
  return undefined
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(min, num), max)
}

export function toString(color: ColorObject | undefined): string | undefined {
  if (!color) return undefined
  const {useComma, useDegrees, useDivision, usePercentage} = color.config!
  const values = color.value.filter((v, i) => i !== 3 || v != 1)
  const hasAlpha = values.length === 4
  if (color.colorSpace === 'rgb') {
    if (color.config?.isHex) {
      const rgba = values.map((c, i) => (i == 3 ? Math.round(c * 255) : c))
      const hexArray = rgba.map((v) => v.toString(16).padStart(2, '0'))
      return ['#', ...hexArray].join('').toUpperCase()
    }
    const nonAlphaRGB = values
      .slice(0, 3)
      .map((v) => (usePercentage ? `${Math.round(v / 2.55)}%` : v))
    return `rgb${hasAlpha ? 'a' : ''}(${nonAlphaRGB.join(
      useComma ? ', ' : ' ',
    )}${
      values.length === 3
        ? ''
        : (useDivision ? ' / ' : ', ') + `${values[3]}`.replace('0.', '.')
    })`
  }
  if (color.colorSpace === 'hsl' || color.colorSpace === 'hwb') {
    const nonAlphaHSL = [
      `${values[0]}${useDegrees ? 'deg' : ''}`,
      ...values.slice(1, 3).map((v) => (usePercentage ? `${v}%` : v)),
    ]
    return `${color.colorSpace}${hasAlpha ? 'a' : ''}(${nonAlphaHSL.join(
      useComma ? ', ' : ' ',
    )}${
      values.length === 3
        ? ''
        : (useDivision ? ' / ' : ', ') + `${values[3]}`.replace('0.', '.')
    })`
  }
  return undefined
}

export default function parse(color: string): ColorObject | undefined {
  const prefix = color.substring(0, 3).toLowerCase() as ColorSpace
  const ColorObject =
    prefix === 'hsl'
      ? parseCylindrical(prefix, 'hsla?', color)
      : prefix === 'hwb'
      ? parseCylindrical(prefix, 'hwba?', color)
      : parseRGB(color)
  if (!ColorObject) return ColorObject
  return {...ColorObject, config: parseConfig(color)}
}
