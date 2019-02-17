/** For `any`s that aren't meant to stay `any`*/
type $FixMe = any
/** For `any`s that we don't care about */
type $IntentionalAny = any
/** For `any`s that cannot be avoided because of a bug in TypeScript */
type $AnyBecauseOfBugInTS = any
/** These should be fixed before the PR getting merged */
type $FixMeNow = any

interface Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: $FixMe
  __REDUX_DEVTOOLS_EXTENSION__?: Function
}

type mixed =
  | object
  | number
  | string
  | boolean
  | symbol
  | undefined
  | null
  | Object
  | void

/**
 * Project-specific globals (such as the unique shape of process.env) will be defined here.
 */

// First, the env variables that exist regardless of the value of NODE_ENV
type CommonEnvironmentVariables = {
  // The hash of the last git commit the moment webpack last started running
  commitHash: string
  version: string
  lf: {
    statePersistencePrefix: string
  }
  launcherBackend: {}
  studio: {
    socketPort: number
  }
  tl: {
    uiPersistenceKey: string
    projectPersistencePrefix: string
    currentProjectStateDefinitionVersion: string
    isCore?: boolean
  }
  KEEPING_DERIVATION_TRACES: boolean
  TRACKING_COLD_DERIVATIONS: boolean
  PATH_TO_ROOT: string
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
    lf: {
      devServerPort: number
    }
    studio: {
      devServerPort: number
      /**
       * If you want the state persistor to not persist the state, you have these options:
       * 'dontLoadOrPersist' => starts with initialstate and doesn't persist the changes
       * 'loadButDontUpdate' => load the state from LB but don't persist changes
       * 'normal' (Default) => load the state from LB and do persist changes
       */
      statePersistenceMode?:
        | 'dontLoadOrPersist'
        | 'loadButDontUpdate'
        | 'normal'
    }
    examples: {
      devServerPort: number
    }
  }
}

type TestSpecificEnvironmentVariables = {
  NODE_ENV: 'test'
}

type ProductionSpecificEnvironmentVariables = {
  NODE_ENV: 'production'
}

// The final encironment variables equal:
// All the common env variables', PLUS (either the dev-specific variables, OR the production-specific variables)
type EnvironmentVariables =
  | (CommonEnvironmentVariables & DevSpecificEnvironmentVariables)
  | (CommonEnvironmentVariables & ProductionSpecificEnvironmentVariables)
  | (CommonEnvironmentVariables & TestSpecificEnvironmentVariables)

declare var $env: EnvironmentVariables

interface Generator_<ReturnType = {}, A = {}, YieldType = {}>
  extends Generator {}

declare module '*.svg' {
  var s: string
  export default s
}

// @todo uncomment this once https://github.com/Microsoft/TypeScript/pull/21316 lands
// type Spread<A, B> = $FixMe

type Diff<T, U> = T extends U ? never : T

// Names of properties in T with types that include undefined
type OptionalPropertyNames<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]

// Common properties from L and R with undefined in R[K] replaced by type in L[K]
type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Diff<R[P], undefined>
}

// Type of { ...L, ...R }
type Spread<L, R> =
  // Properties in L that don't exist in R
  Pick<L, Diff<keyof L, keyof R>> &
    // Properties in R with types that exclude undefined
    Pick<R, Diff<keyof R, OptionalPropertyNames<R>>> &
    // Properties in R, with types that include undefined, that don't exist in L
    Pick<R, Diff<OptionalPropertyNames<R>, keyof L>> &
    // Properties in R, with types that include undefined, that exist in L
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>

declare module 'lodash/fp' {
  function set<S extends {}>(path: Array<string | number>, v: mixed, s: S): S
  function get(path: Array<string | number>, s: {}): mixed
}

declare module '*.png' {
  const s: string
  export default s
}

declare module 'socket.io' {
  const a: any
  export default a
}

declare module 'fuzzaldrin-plus'

declare module 'error-overlay-webpack-plugin' {
  const a: any
  export default a
}

declare module 'json-touch-patch' {
  type Diff = $FixMe
  const patch: <State>(s: State, diffs: Array<Diff>) => State
  export default patch
}

declare module 'lodash/fp/update' {
  const update: $FixMe
  export default update
}

declare module 'hoist-non-react-statics' {
  const hoist: $FixMe
  export default hoist
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

declare module 'timing-function/lib/UnitBezier'
