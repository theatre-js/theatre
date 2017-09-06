// @flow
import fse from 'fs-extra'
import {call, select} from '$shared/utils/sagas'
import {type StoreState} from '$lb/types'
import {multiReduceState} from '$shared/utils'

export type ErrorTypes = 'projectAlreadyRecognised' | 'fileDoesntExist'

export default function* recogniseProject(params: {filePath: string}): Generator<*, {type: 'ok'} | {type: 'error', errorType: ErrorTypes}, *> {
  const state: StoreState = (yield select(): $FixMe)

  if (state.projects.listOfPaths.indexOf(params.filePath) !== -1) {
    return {type: 'error', errorType: 'projectAlreadyRecognised'}
  }

  if ((yield * call(fse.pathExists, params.filePath)) !== true) {
    return {type: 'error', errorType: 'fileDoesntExist'}
  }

  yield multiReduceState([
    {path: ['projects', 'listOfPaths'], reducer: (paths) => ([...paths, params.filePath])},
  ])

  return {type: 'ok'}
}