// @flow
import {type ComponentModelNamespaceState} from './types'
import * as D from '$shared/DataVerse'

// @todo: Define ComponentModelNamespaceState with literals
const initialState: ComponentModelNamespaceState = D.literals.object({
  componentDescriptorsById: D.literals.object({

  }),
})

export default initialState