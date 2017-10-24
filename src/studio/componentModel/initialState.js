// @flow
import {type ComponentModelNamespaceState} from './types'
import coreComponentDescriptors from './coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors'

const initialState: ComponentModelNamespaceState = {
  componentDescriptors: {
    core: coreComponentDescriptors,
    custom: {},
  },
  modifierDescriptors: {
    core: coreModifierDescriptors,
  },
}

const a = `
saaasssasdf
`

export default initialState