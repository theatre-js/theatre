import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'

export async function loadStudio() {
  studio.extend(extension)
  studio.initialize()
}
