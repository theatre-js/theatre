// @flow
import * as D from '$shared/DataVerse'

export type CommonNamespaceState = D.MapOfReferences<{
  temp: D.MapOfReferences<{
    /**
     * state.temp.bootstrapped is initially false, until the app is ready to respond to user events, at which point
     * it will be set to true.
     */
    bootstrapped: D.Reference<boolean>,
  }>,
}>