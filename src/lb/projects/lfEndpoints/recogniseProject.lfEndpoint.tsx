import fse from 'fs-extra'
import {call, select} from '$shared/utils/sagas'
import {StoreState} from '$lb/types'
import {multiReduceState} from '$shared/utils'

export type ErrorTypes = 'projectAlreadyRecognised' | 'fileDoesntExist'

export default function* recogniseProject(params: {
  filePath: string
}): Generator_<
  $FixMe,
  {type: 'ok'} | {type: 'error'; errorType: ErrorTypes},
  $FixMe
> {
  const state: StoreState = yield select() as $FixMe

  if (state.projects.listOfPaths.indexOf(params.filePath) !== -1) {
    return {type: 'error', errorType: 'projectAlreadyRecognised'}
  }

  if ((yield* call(fse.pathExists, params.filePath)) !== true) {
    return {type: 'error', errorType: 'fileDoesntExist'}
  }

  yield multiReduceState([
    {
      path: ['projects', 'listOfPaths'],
      reducer: paths => [...paths, params.filePath],
    },
  ])

  return {type: 'ok'}
}
