import {LBStoreState} from '$lb/types'
import {multiReduceState} from '$shared/utils'
import _ from 'lodash'
import {select} from 'redux-saga/effects'

type ErrorTypes = 'projectNotRecognised'

export default function* unrecogniseProject(params: {
  filePath: string
}): Generator_<
  $FixMe,
  {type: 'ok'} | {type: 'error'; errorType: ErrorTypes},
  $FixMe
> {
  const state: LBStoreState = yield select() as $FixMe

  if (state.projects.listOfPaths.indexOf(params.filePath) === -1) {
    return {type: 'error', errorType: 'projectNotRecognised'}
  }

  yield multiReduceState([
    {
      path: ['projects', 'listOfPaths'],
      reducer: (paths: string[]) => _.without(paths, params.filePath),
    },
  ])

  return {type: 'ok'}
}
