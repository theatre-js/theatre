export const absoluteDims = (w: number, h = w) => `
  left: ${w * -0.5}px;
  top: ${h * -0.5}px;
  width: ${w}px;
  height: ${h}px;
`
