// @flow
import {type CommonNamespaceState} from './types'
import * as D from '$shared/DataVerse'

const initialState: CommonNamespaceState = D.literals.object({
  temp: D.literals.object({
    bootstrapped: D.literals.primitive(false),
  }),
})

export default initialState