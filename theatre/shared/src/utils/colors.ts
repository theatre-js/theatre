export function validHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}){1,2}([A-Fa-f0-9]{2})?$/.test(hex)
}

export function hexToDecimal(hex: string): number {
  if (validHex(hex)) {
    let c = hex.substring(1).split('')
    if (c.length == 3)
      hex = [c[0], c[0], c[1], c[1], c[2], c[2], 'F', 'F'].join('')
    if (c.length == 6) hex += 'FF'
    const values = hex.match(/[A-Fa-f0-9]{2}/g)
    if (values != null) {
      const [r, g, b, a] = values.map((hex) => parseInt(hex, 16))
      console.log(hex, r, g, b, a)
      return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0
    }
  }
  return 0
}

export function decimalToHex(value: number): string {
  let alpha = ((value >> 24) & 0xff).toString(16).padStart(2, '0')
  if (value > 0xffffff && value >>> 24 === 0xff) alpha = ''
  return (
    '#' +
    ((value >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((value >> 8) & 0xff).toString(16).padStart(2, '0') +
    (value & 0xff).toString(16).padStart(2, '0') +
    alpha
  ).toUpperCase()
}

export function interpolate(l: number, r: number, progression: number) {
  const left_a = (l >> 24) & 0xff,
    right_a = (r >> 24) & 0xff,
    interpolated_a = Math.floor((right_a - left_a) * progression + left_a)
  const left_r = (l >> 16) & 0xff,
    right_r = (r >> 16) & 0xff,
    interpolated_r = Math.floor((right_r - left_r) * progression + left_r)
  const left_g = (l >> 8) & 0xff,
    right_g = (r >> 8) & 0xff,
    interpolated_g = Math.floor((right_g - left_g) * progression + left_g)
  const left_b = l & 0xff,
    right_b = r & 0xff,
    interpolated_b = Math.floor((right_b - left_b) * progression + left_b)
  return (
    ((interpolated_a << 24) |
      (interpolated_r << 16) |
      (interpolated_g << 8) |
      interpolated_b) >>>
    0
  )
}
