export const findingColdDerivations = true

export let skippingColdDerivations = false
export const skipFindingColdDerivations = () => {
  skippingColdDerivations = true
}
export const endSkippingColdDerivations = () => {
  skippingColdDerivations = false
}
