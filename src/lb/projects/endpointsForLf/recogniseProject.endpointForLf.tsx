import fse from 'fs-extra'
import {LBStoreState} from '$lb/types'
import {select, call, put} from 'redux-saga/effects'
import {multiReduceStateAction} from '$shared/utils/redux/commonActions'

export type ErrorTypes = 'projectAlreadyRecognised' | 'fileDoesntExist'

export default function* recogniseProject(params: {
  filePath: string
}): Generator_<
  $FixMe,
  {type: 'ok'} | {type: 'error'; errorType: ErrorTypes},
  $FixMe
> {
  const state: LBStoreState = yield select()

  if (state.projects.listOfPaths.indexOf(params.filePath) !== -1) {
    return {type: 'error', errorType: 'projectAlreadyRecognised'}
  }

  if ((yield call(fse.pathExists, params.filePath)) !== true) {
    return {type: 'error', errorType: 'fileDoesntExist'}
  }

  yield put(
    multiReduceStateAction([
      {
        path: ['projects', 'listOfPaths'],
        reducer: paths => [...paths, params.filePath],
      },
    ]),
  )

  return {type: 'ok'}
}
