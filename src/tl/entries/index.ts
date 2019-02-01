import * as core from './coreExports'
import TheatreJSUI from '$tl/facades/TheatreJSUI'
export * from './coreExports'

export const ui = new TheatreJSUI()
ui.show()

/**
 * Since Theatre is available as a global object, we need to somehow export its
 * type so that we can use it inside the typescript files in the examples
 * folder. See examples/tl/1/index.ts for an example.
 */

export type TypeOfTheatre = typeof core & {
  ui: typeof ui
}

export default {
  ui,
  ...core
}