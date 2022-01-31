export function parseRgbaFromHex(rgba: string) {
  rgba = rgba.trim().toLowerCase()
  const hex = rgba.match(/^#?([0-9a-f]{8})$/i)

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

export function linearSrgbToSrgb(rgba: Rgba) {
  function compress(x: number) {
    // This looks funky because sRGB uses a linear scale below 0.0031308 in
    // order to avoid an infinite slope, while trying to approximate gamma 2.2
    // as closely as possible, hence the branching and the 2.4 exponent.
    if (x >= 0.0031308) return 1.055 * x ** (1.0 / 2.4) - 0.055
    else return 12.92 * x
  }
  return {
    r: compress(rgba.r),
    g: compress(rgba.g),
    b: compress(rgba.b),
    a: rgba.a,
  }
}

export function srgbToLinearSrgb(rgba: Rgba) {
  function expand(x: number) {
    if (x >= 0.04045) return ((x + 0.055) / (1 + 0.055)) ** 2.4
    else return x / 12.92
  }
  return {
    r: expand(rgba.r),
    g: expand(rgba.g),
    b: expand(rgba.b),
    a: rgba.a,
  }
}

export function linearSrgbToOklab(rgba: Rgba) {
  let l = 0.4122214708 * rgba.r + 0.5363325363 * rgba.g + 0.0514459929 * rgba.b
  let m = 0.2119034982 * rgba.r + 0.6806995451 * rgba.g + 0.1073969566 * rgba.b
  let s = 0.0883024619 * rgba.r + 0.2817188376 * rgba.g + 0.6299787005 * rgba.b

  let l_ = Math.cbrt(l)
  let m_ = Math.cbrt(m)
  let s_ = Math.cbrt(s)

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
    alpha: rgba.a,
  }
}

export function oklabToLinearSrgb(laba: Laba) {
  let l_ = laba.L + 0.3963377774 * laba.a + 0.2158037573 * laba.b
  let m_ = laba.L - 0.1055613458 * laba.a - 0.0638541728 * laba.b
  let s_ = laba.L - 0.0894841775 * laba.a - 1.291485548 * laba.b

  let l = l_ * l_ * l_
  let m = m_ * m_ * m_
  let s = s_ * s_ * s_

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    a: laba.alpha,
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
