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
}

// Some environment variables are specific to NODE_ENV='development'
type DevSpecificEnvironmentVariables = {
  NODE_ENV: 'development',
  devSpecific: {
    launcherFrontend: {
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
  CommonEnvironmentVariables & (
    DevSpecificEnvironmentVariables |
    ProductionSpecificEnvironmentVariables
  )

declare var process: {
  env: EnvironmentVariables,
}

declare var module: {
  +hot?: {
    +accept: (
      & ((add: string, callback: Function) => mixed)
      & (() => mixed)
    ),
    +dispose: (() => mixed),
  },
}