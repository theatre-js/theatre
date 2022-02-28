interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: $IntentionalAny
  __IS_VISUAL_REGRESSION_TESTING?: boolean
}

interface NodeModule {
  hot?: {
    accept(path: string, callback: () => void): void
  }
}

interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test'
  version: string
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

declare module 'propose' {
  const propose: (
    str: string,
    dictionary: string[],
    options?: {threshold?: number; ignoreCase?: boolean},
  ) => string | null
  export default propose
}

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
declare module 'clean-webpack-plugin'
declare module 'webpack-notifier'
declare module 'case-sensitive-paths-webpack-plugin'
declare module 'tsconfig-paths-webpack-plugin'
declare module 'webpack-deep-scope-plugin'
declare module 'error-overlay-webpack-plugin'
declare module 'circular-dependency-plugin'
declare module 'lodash-webpack-plugin'
declare module 'webpack-bundle-analyzer'
declare module 'merge-deep'
declare module 'exec-loader!./commitHash'
