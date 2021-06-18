interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: $IntentionalAny
}

interface NodeModule {
  hot?: {
    accept(path: string, callback: () => void): void
  }
}

// First, the env variables that exist regardless of the value of NODE_ENV
type CommonEnvironmentVariables = {
  version: string
  isCore: boolean
  studioPersistenceKey: string
  currentProjectStateDefinitionVersion: string
  disableStatePersistence?: boolean
}

// Some environment variables are specific to NODE_ENV='development'
type DevSpecificEnvironmentVariables = {
  NODE_ENV: 'development'
  devSpecific: {
    devServerHost: string
    devServerSSL?: {
      useSSL?: boolean
      pathToKey: string
      pathToCert: string
    }
  }
}

type TestSpecificEnvironmentVariables = {
  NODE_ENV: 'test'
}

type ProductionSpecificEnvironmentVariables = {
  NODE_ENV: 'production'
}

type EnvironmentVariables =
  | (CommonEnvironmentVariables & DevSpecificEnvironmentVariables)
  | (CommonEnvironmentVariables & ProductionSpecificEnvironmentVariables)
  | (CommonEnvironmentVariables & TestSpecificEnvironmentVariables)

declare let $env: EnvironmentVariables

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

declare module 'timing-function/lib/UnitBezier'
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
