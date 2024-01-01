declare module globalThis {
  /**
   * This is set to true when running the tests, so that `@theatre/core` will try to conenct to `@theatre/studio`,
   * even if `typeof window === 'undefined'`.
   */
  var __THEATREJS__FORCE_CONNECT_CORE_AND_STUDIO: boolean | undefined
}

interface NodeModule {
  hot?: {
    accept(path: string, callback: () => void): void
  }
}

interface Window {
  __IS_VISUAL_REGRESSION_TESTING?: boolean
}

declare module '*.svg' {
  var s: string
  export default s
}

declare module '*.png' {
  const s: string
  export default s
}

declare module 'json-touch-patch' {
  type Diff = $FixMe
  const patch: <State>(s: State, diffs: Diff[]) => State
  export default patch
}

declare module 'jiff'
declare module '*.json'

// declare module 'inspect.macro' {
//   const inspect: (...vals: $IntentionalAny[]) => void
//   export default inspect
// }

declare module 'timing-function/lib/UnitBezier' {
  export default class UnitBezier {
    constructor(p1x: numbe, p1y: number, p2x: number, p2y: number)
    solve(progression: number, epsilon: number)
    solveSimple(progression: number)
  }
}
declare module 'circular-dependency-plugin'
declare module 'merge-deep'
declare module 'blob-compare' {
  const compare: (left: File | Blob, right: File | Blob) => Promise<boolean>
  export default compare
}
