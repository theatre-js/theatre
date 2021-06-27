import type {Studio} from './Studio'

let studio: Studio

export function setStudio(s: Studio) {
  studio = s
}

/**
 * This may only be called from modules inside the studio bundle.
 */
export default function getStudio(): Studio {
  return studio
}
