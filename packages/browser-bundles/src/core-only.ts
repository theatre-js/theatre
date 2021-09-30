import * as core from '@theatre/core'

// @ts-ignore
window.Theatre = {
  core,
  get studio() {
    alert(
      "Theatre.studio is only available in the core-and-studio.js bundle. You're using the core-only.min.js bundle.",
    )
    return undefined
  },
}
