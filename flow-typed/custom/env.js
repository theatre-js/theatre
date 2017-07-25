// @flow

/**
 * Any project-specific globals (which we should strive to have none) should be typed
 * here
 */
 declare var process: {
  +env: {
    BACKEND_BASE_URL: string,
    NODE_ENV: 'development' | 'production',
    REDUX_PERSIST_KEY_PREFIX: string,
    AMPLITUDE_API_KEY: string,
  },

  exit: () => void,
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