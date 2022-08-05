import studio from '@theatre/studio'
import type {IStudio} from '@theatre/studio'

export function loadStudio(setStudio: (studio: IStudio) => void) {
  studio.initialize()
  setStudio(studio)
}
