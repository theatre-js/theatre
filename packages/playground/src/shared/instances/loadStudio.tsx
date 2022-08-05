import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'

export function loadStudio() {
  studio.extend(extension)
  studio.initialize()
}
