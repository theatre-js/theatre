// @flow
import fse from 'fs-extra'
import {call, select} from '$shared/utils/sagas'
import path from 'path'
import {type StoreState} from '$lb/types'
import {
  default as recogniseProject,
  type ErrorTypes as RecognizeProjectErrorTypes,
} from './recogniseProject.lfEndpoint'

type ErrorTypes =
  | 'folderDoesntExist'
  | 'pathUnreadable'
  | 'pathIsNotAFolder'
  | 'projectAlreadyRecognised'
  | 'theaterjsDotJsonFileAlreadyExists'
  | RecognizeProjectErrorTypes

export default function* createNewProject(params: {
  folderPath: string,
  name: string,
}): Generator<
  *,
  {type: 'ok', filePath: string} | {type: 'error', errorType: ErrorTypes},
  *,
> {
  if (!(yield call(fse.pathExists, params.folderPath))) {
    return {type: 'error', errorType: 'folderDoesntExist'}
  }

  let pathStat: $FixMe
  try {
    pathStat = yield call(fse.stat, params.folderPath)
  } catch (e) {
    console.error(e)
    return {type: 'error', errorType: 'pathUnreadable'}
  }

  if (!(pathStat: any).isDirectory()) {
    return {type: 'error', errorType: 'pathIsNotAFolder'}
  }

  const filePath = path.join(params.folderPath, 'theaterjs.json')
  const state: StoreState = (yield select(): $FixMe)

  if (state.projects.listOfPaths.indexOf(filePath) !== -1) {
    return {type: 'error', errorType: 'projectAlreadyRecognised'}
  }

  if (yield call(fse.pathExists, filePath)) {
    return {type: 'error', errorType: 'theaterjsDotJsonFileAlreadyExists'}
  }

  const fileContent = JSON.stringify({name: params.name})
  yield call(fse.writeFile, filePath, fileContent, {encoding: 'utf-8'})
  const resultOfRecognise = yield* call(recogniseProject, {filePath})
  if (resultOfRecognise.type === 'ok') {
    return {...resultOfRecognise, filePath}
  } else {
    return {type: 'error', errorType: resultOfRecognise.errorType}
  }
}
