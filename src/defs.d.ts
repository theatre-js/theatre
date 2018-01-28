/**
 * For `any`s that aren't meant to stay `any`
 */
type $FixMe = any
/** For `any`s that we don't care about */
type $IntentionalAny = any

interface Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__: any
}


type mixed = {}

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

type Spread<A, B> = $FixMe

declare module "*.svg" {
  var s: string
  export default s
}