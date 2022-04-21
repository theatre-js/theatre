import {useMemo, useRef, useState} from 'react'

// n mod m
export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export function stringFromBezierPoints(
  points: [number, number, number, number],
) {
  return points.map((p) => p.toFixed(2)).join(', ')
}

const MAX_REASONABLE_BEZIER_STRING = 128
export function bezierPointsFromString(
  str: string,
): null | [number, number, number, number] {
  if (str.length > MAX_REASONABLE_BEZIER_STRING) return null
  const args = str.split(',')
  if (args.length !== 4) return null
  const nums = args.map((arg) => {
    return Number(arg.trim())
  })

  if (!nums.every((v) => isFinite(v))) return null

  if (nums[0] < 0 || nums[0] > 1 || nums[2] < 0 || nums[2] > 1) return null
  return nums as [number, number, number, number]
}

export const EASING_PRESETS = [
  {label: 'Back In Out', value: '0.680, -0.550, 0.265, 1.550'},
  {label: 'Back In', value: '0.600, -0.280, 0.735, 0.045'},
  {label: 'Back Out', value: '0.175, 0.885, 0.320, 1.275'},

  {label: 'Circ In Out', value: '0.785, 0.135, 0.150, 0.860'},
  {label: 'Circ In', value: '0.600, 0.040, 0.980, 0.335'},
  {label: 'Circ Out', value: '0.075, 0.820, 0.165, 1'},

  {label: 'Expo In Out', value: '1, 0, 0, 1'},
  {label: 'Expo In', value: '0.78, 0.00, 0.81, 0.00'},
  {label: 'Expo Out', value: '0.190, 1, 0.220, 1'},

  {label: 'Cubic In Out', value: '0.645, 0.045, 0.355, 1'},
  {label: 'Cubic In', value: '0.550, 0.055, 0.675, 0.190'},
  {label: 'Cubic Out', value: '0.215, 0.610, 0.355, 1'},

  {label: 'Quad In Out', value: '0.455, 0.030, 0.515, 0.955'},
  {label: 'Quad In', value: '0.550, 0.085, 0.680, 0.530'},
  {label: 'Quad Out', value: '0.250, 0.460, 0.450, 0.940'},

  {label: 'Quart In Out', value: '0.770, 0, 0.175, 1'},
  {label: 'Quart In', value: '0.895, 0.030, 0.685, 0.220'},
  {label: 'Quart Out', value: '0.165, 0.840, 0.440, 1'},

  {label: 'Quint In Out', value: '0.860, 0, 0.070, 1'},
  {label: 'Quint In', value: '0.755, 0.050, 0.855, 0.060'},
  {label: 'Quint Out', value: '0.230, 1, 0.320, 1'},

  {label: 'Sine In Out', value: '0.445, 0.050, 0.550, 0.950'},
  {label: 'Sine In', value: '0.470, 0, 0.745, 0.715'},
  {label: 'Sine Out', value: '0.390, 0.575, 0.565, 1'},

  {label: 'Ease Out In', value: '.42, 0, .58, 1'},
  {label: 'Linear', value: '0.5, 0.5, 0.5, 0.5'},
]

/**
 * The same as useMemo except that it can be frozen so that
 * the memoized function is not recomputed even if the dependencies
 * change. It can also be unfrozen.
 *
 * An unfrozen useFreezableMemo is the same as useMemo.
 *
 */
export function useFreezableMemo<T>(
  fn: (setFreeze: (isFrozen: boolean) => void) => T,
  deps: any[],
): T {
  const [isFrozen, setFreeze] = useState<boolean>(false)
  const freezableDeps = useRef(deps)

  if (!isFrozen) freezableDeps.current = deps

  return useMemo(() => fn(setFreeze), freezableDeps.current)
}

// Used in the development process and works well, but ended up not
// being the tool for the job.
function useRefreshableMemo<T>(
  fn: (refresh: () => void) => T,
  additionalDeps: any[],
): T {
  const [version, setVersion] = useState(0)
  return useMemo(
    () => fn(() => setVersion(version + 1)),
    [version, ...additionalDeps],
  )
}
