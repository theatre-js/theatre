// @flow
import {select} from '$shared/utils/sagas'
import {StoreState} from '$lb/types'
import {multiReduceState} from '$shared/utils'
import _ from 'lodash'

type ErrorTypes = 'projectNotRecognised'

export default function* unrecogniseProject(params: {
  filePath: string,
}): Generator_<*, {type: 'ok'} | {type: 'error', errorType: ErrorTypes}, *> {
  const state: StoreState = (yield select(): $FixMe)

  if (state.projects.listOfPaths.indexOf(params.filePath) === -1) {
    return {type: 'error', errorType: 'projectNotRecognised'}
  }

  yield multiReduceState([
    {
      path: ['projects', 'listOfPaths'],
      reducer: paths => _.without(paths, params.filePath),
    },
  ])

  return {type: 'ok'}
}
