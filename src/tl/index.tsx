import UI from '$tl/ui/UI'
import Project from '$tl/Project/Project'

export {Project}

export const ui = new UI()

/**
 * Since TL is available as a global object, we need to somehow export its
 * type so that we can use it inside the typescript files in the examples
 * folder. See examples/tl/1/index.ts for an example.
 */
const TL = {
  ui,
  Project,
}

export type TypeOfTL = typeof TL
