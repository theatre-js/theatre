export function parseRgbaFromHex(rgba: string) {
  rgba = rgba.trim().toLowerCase()
  const hex = rgba.match(/^#([0-9a-f]{8})$/i)

  if (!hex) {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    }
  }

  const match = hex[1]
  return {
    r: parseInt(match.substr(0, 2), 16) / 255,
    g: parseInt(match.substr(2, 2), 16) / 255,
    b: parseInt(match.substr(4, 2), 16) / 255,
    a: parseInt(match.substr(6, 2), 16) / 255,
  }
}

export function rgba2hex(rgba: Rgba) {
  const hex =
    ((rgba.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((rgba.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((rgba.b * 255) | (1 << 8)).toString(16).slice(1) +
    ((rgba.a * 255) | (1 << 8)).toString(16).slice(1)

  return `#${hex}`
}

// TODO: We should add a decorate property to the propConfig too.
// Right now, each place that has anything to do with a color is individually
// responsible for defining a toString() function on the object it returns.
export function decorateRgba(rgba: Rgba) {
  return {
    ...rgba,
    toString() {
      return rgba2hex(this)
    },
  }
}

export type Rgba = {
  r: number
  g: number
  b: number
  a: number
}

export type Laba = {
  L: number
  a: number
  b: number
  alpha: number
}
