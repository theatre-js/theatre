/**
 * For `any`s that aren't meant to stay `any`
 */
type $FixMe = any
/** For `any`s that we don't care about */
type $IntentionalAny = any

interface Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: any
}


type mixed = object | number | string | boolean | symbol | undefined | null

// @flow

/**
 * Project-specific globals (such as the unique shape of process.env) will be defined here.
 */

// First, the env variables that exist regardless of the value of NODE_ENV
type CommonEnvironmentVariables = {
  // The hash of the last git commit the moment webpack last started running
  commitHash: string,
  launcherFrontend: {
    statePersistencePrefix: string,
  },
  launcherBackend: {

  },
  studio: {
    socketPort: number,
  },
  KEEPING_DERIVATION_TRACES: boolean,
  TRACKING_COLD_DERIVATIONS: boolean,
}

// Some environment variables are specific to NODE_ENV='development'
type DevSpecificEnvironmentVariables = {
  NODE_ENV: 'development',
  devSpecific: {
    launcherFrontend: {
      devServerPort: number,
    },
    studio: {
      devServerPort: number,
    },
    examples: {
      devServerPort: number,
    },
  },
}

type ProductionSpecificEnvironmentVariables = {
  NODE_ENV: 'production',
}


// The final encironment variables equal:
// All the common env variables', PLUS (either the dev-specific variables, OR the production-specific variables)
type EnvironmentVariables =
  (CommonEnvironmentVariables & DevSpecificEnvironmentVariables) |
  (CommonEnvironmentVariables & ProductionSpecificEnvironmentVariables)

declare var process: {
  env: EnvironmentVariables,
}

declare var module: {
  hot?: {
    accept: (
      & ((add: string, callback: Function) => mixed)
      & (() => mixed)
    ),
    dispose: (() => mixed),
  },
}

type Generator_<A, ReturnType, YieldType> = Generator

declare module "*.svg" {
  var s: string
  export default s
}

// @todo uncomment this once https://github.com/Microsoft/TypeScript/pull/21316 lands
type Spread<A, B> = $FixMe
/*
// Names of properties in T with types that include undefined
type OptionalPropertyNames<T> =
    { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T];

// Common properties from L and R with undefined in R[K] replaced by type in L[K]
type SpreadProperties<L, R, K extends keyof L & keyof R> =
    { [P in K]: L[P] | Diff<R[P], undefined> };

// Type of { ...L, ...R }
type Spread<L, R> =
    // Properties in L that don't exist in R
    & Pick<L, Diff<keyof L, keyof R>>
    // Properties in R with types that exclude undefined
    & Pick<R, Diff<keyof R, OptionalPropertyNames<R>>>
    // Properties in R, with types that include undefined, that don't exist in L
    & Pick<R, Diff<OptionalPropertyNames<R>, keyof L>>
    // Properties in R, with types that include undefined, that exist in L
    & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>;
  */