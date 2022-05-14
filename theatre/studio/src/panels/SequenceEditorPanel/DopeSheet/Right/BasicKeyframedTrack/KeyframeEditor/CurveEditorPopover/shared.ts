/**
 * This 4-tuple defines the start control point x1,y1 and the end control point x2,y2
 * of a cubic bezier curve. It is assumed that the start of the curve is fixed at 0,0
 * and the end is fixed at 1,1. X values must be constrained to `0 <= x1 <= 1 and 0 <= x2 <= 1`.
 *
 * to get a feel for it: https://cubic-bezier.com/
 **/
export type CubicBezierHandles = [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
]

/**
 * A full CSS cubic bezier string looks like `cubic-bezier(0, 0, 1, 1)`.
 * the "args" part of the name refers specifically to the comma separated substring
 * inside the parentheses of the CSS cubic bezier string i.e. `0, 0, 1, 1`.
 */
export type CSSCubicBezierArgsString = string

const CSS_BEZIER_ARGS_DECIMAL_POINTS = 3 // Doesn't have to be 3, but it matches our preset data

/** Returns e.g. `"0, 0, 1, 1"`. See {@link CSSCubicBezierArgsString} docs for more context. */
export function cssCubicBezierArgsFromHandles(
  points: CubicBezierHandles,
): CSSCubicBezierArgsString {
  return points.map((p) => p.toFixed(CSS_BEZIER_ARGS_DECIMAL_POINTS)).join(', ')
}

const MAX_REASONABLE_BEZIER_STRING = 128
export function handlesFromCssCubicBezierArgs(
  str: CSSCubicBezierArgsString | undefined | null,
): null | CubicBezierHandles {
  if (!str || str?.length > MAX_REASONABLE_BEZIER_STRING) return null
  const args = str.split(',')
  if (args.length !== 4) return null
  const nums = args.map((arg) => {
    return Number(arg.trim())
  })

  if (!nums.every((v) => isFinite(v))) return null

  if (nums[0] < 0 || nums[0] > 1 || nums[2] < 0 || nums[2] > 1) return null
  return nums as CubicBezierHandles
}

/**
 * A collection of cubic-bezier approximations of common easing functions
 * - ref: https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
 * - ref: [GitHub issue 28 comment "michaeltheory's suggested default easing presets"](https://github.com/theatre-js/theatre/issues/28#issuecomment-938752916)
 **/
export const EASING_PRESETS = [
  {label: 'Quad Out', value: '0.250, 0.460, 0.450, 0.940'},
  {label: 'Quad In Out', value: '0.455, 0.030, 0.515, 0.955'},
  {label: 'Quad In', value: '0.550, 0.085, 0.680, 0.530'},

  {label: 'Cubic Out', value: '0.215, 0.610, 0.355, 1.000'},
  {label: 'Cubic In Out', value: '0.645, 0.045, 0.355, 1.000'},
  {label: 'Cubic In', value: '0.550, 0.055, 0.675, 0.190'},

  {label: 'Quart Out', value: '0.165, 0.840, 0.440, 1.000'},
  {label: 'Quart In Out', value: '0.770, 0.000, 0.175, 1.000'},
  {label: 'Quart In', value: '0.895, 0.030, 0.685, 0.220'},

  {label: 'Quint Out', value: '0.230, 1.000, 0.320, 1.000'},
  {label: 'Quint In Out', value: '0.860, 0.000, 0.070, 1.000'},
  {label: 'Quint In', value: '0.755, 0.050, 0.855, 0.060'},

  {label: 'Sine Out', value: '0.390, 0.575, 0.565, 1.000'},
  {label: 'Sine In Out', value: '0.445, 0.050, 0.550, 0.950'},
  {label: 'Sine In', value: '0.470, 0.000, 0.745, 0.715'},

  {label: 'Expo Out', value: '0.190, 1.000, 0.220, 1.000'},
  {label: 'Expo In Out', value: '1.000, 0.000, 0.000, 1.000'},
  {label: 'Expo In', value: '0.780, 0.000, 0.810, 0.00'},

  {label: 'Circ Out', value: '0.075, 0.820, 0.165, 1.000'},
  {label: 'Circ In Out', value: '0.785, 0.135, 0.150, 0.860'},
  {label: 'Circ In', value: '0.600, 0.040, 0.980, 0.335'},

  {label: 'Back Out', value: '0.175, 0.885, 0.320, 1.275'},
  {label: 'Back In Out', value: '0.680, -0.550, 0.265, 1.550'},
  {label: 'Back In', value: '0.600, -0.280, 0.735, 0.045'},

  {label: 'linear', value: '0.5, 0.5, 0.5, 0.5'},
  {label: 'In Out', value: '0.42,0,0.58,1'},

  /* These easings are not being included initially in order to
     simplify the choices */
  // {label: 'Back In Out', value: '0.680, -0.550, 0.265, 1.550'},
  // {label: 'Back In', value: '0.600, -0.280, 0.735, 0.045'},
  // {label: 'Back Out', value: '0.175, 0.885, 0.320, 1.275'},

  // {label: 'Circ In Out', value: '0.785, 0.135, 0.150, 0.860'},
  // {label: 'Circ In', value: '0.600, 0.040, 0.980, 0.335'},
  // {label: 'Circ Out', value: '0.075, 0.820, 0.165, 1'},

  // {label: 'Quad In Out', value: '0.455, 0.030, 0.515, 0.955'},
  // {label: 'Quad In', value: '0.550, 0.085, 0.680, 0.530'},
  // {label: 'Quad Out', value: '0.250, 0.460, 0.450, 0.940'},

  // {label: 'Ease Out In', value: '.42, 0, .58, 1'},
]

/**
 * Compares two easings and returns true iff they are similar up to a threshold
 *
 * @param easing1 - first easing to compare
 * @param easing2 - second easing to compare
 * @param options - optionally pass an object with a threshold that determines how similar the easings should be
 * @returns boolean if the easings are similar
 */
export function areEasingsSimilar(
  easing1: CubicBezierHandles | null | undefined,
  easing2: CubicBezierHandles | null | undefined,
  options: {
    threshold: number
  } = {threshold: 0.02},
) {
  if (!easing1 || !easing2) return false
  let totalDiff = 0
  for (let i = 0; i < 4; i++) {
    totalDiff += Math.abs(easing1[i] - easing2[i])
  }
  return totalDiff < options.threshold
}
