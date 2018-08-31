import UI from '$tl/ui/UI'
import * as core from './core'

export * from './core'

export const ui = new UI()
ui.enable()

/**
 * Since Theatre is available as a global object, we need to somehow export its
 * type so that we can use it inside the typescript files in the examples
 * folder. See examples/tl/1/index.ts for an example.
 */

export type TypeOfTheatre = typeof core & {
  ui: typeof ui
}
