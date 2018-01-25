// @flow

export type CommonNamespaceState = {
  temp: {
    /**
     * state.temp.bootstrapped is initially false, until the app is ready to respond to user events, at which point
     * it will be set to true.
     */
    bootstrapped: boolean,
  },
}
