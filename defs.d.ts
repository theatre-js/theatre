/**
 * For `any`s that aren't meant to stay `any`
 */
type $FixMe = any
/** For `any`s that we don't care about */
type $IntentionalAny = any
type $AnyBecauseOfBugInTS = any

interface Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: $FixMe
  devToolsExtension?: Function
}

type mixed = object | number | string | boolean | symbol | undefined | null | Object | void

/**
 * Project-specific globals (such as the unique shape of process.env) will be defined here.
 */

// First, the env variables that exist regardless of the value of NODE_ENV
type CommonEnvironmentVariables = {
  // The hash of the last git commit the moment webpack last started running
  commitHash: string
  lf: {
    statePersistencePrefix: string
  }
  launcherBackend: {}
  theater: {
    socketPort: number
  }
  tl: {
    version: string
  }
  KEEPING_DERIVATION_TRACES: boolean
  TRACKING_COLD_DERIVATIONS: boolean
  PATH_TO_ROOT: string
}

// Some environment variables are specific to NODE_ENV='development'
type DevSpecificEnvironmentVariables = {
  NODE_ENV: 'development'
  devSpecific: {
    lf: {
      devServerPort: number
    }
    theater: {
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

declare var process: {
  env: EnvironmentVariables
}

declare var module: {
  hot?: {
    accept: ((add: string, callback: Function) => mixed) & (() => mixed)
    dispose: (() => mixed)
  }
}

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

// import {TL as TL_} from '$src/tl'

// declare var TL: string

