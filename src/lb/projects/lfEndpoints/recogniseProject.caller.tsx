// @flow
import recogniseProject from './recogniseProject.lfEndpoint'
import {makeLFCaller} from '$lb/common/utils'

const fn: typeof recogniseProject = makeLFCaller('recogniseProject')

export default fn
