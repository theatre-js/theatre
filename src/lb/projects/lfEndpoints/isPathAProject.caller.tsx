// @flow
import isPathAProject from './isPathAProject.lfEndpoint'
import {makeLFCaller} from '$lb/common/utils'

const fn: typeof isPathAProject = makeLFCaller('isPathAProject')

export default fn
