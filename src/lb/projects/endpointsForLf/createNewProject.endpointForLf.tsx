import fse from 'fs-extra'
import path from 'path'
import {LBStoreState} from '$lb/types'
import {
  default as recogniseProject,
  ErrorTypes as RecognizeProjectErrorTypes,
} from './recogniseProject.endpointForLf'
import {call, select} from 'redux-saga/effects'

type ErrorTypes =
  | 'folderDoesntExist'
  | 'pathUnreadable'
  | 'pathIsNotAFolder'
  | 'projectAlreadyRecognised'
  | 'theaterDotJsonFileAlreadyExists'
  | RecognizeProjectErrorTypes

export default function* createNewProject(params: {
  folderPath: string
  name: string
}): Generator_<
  $FixMe,
  {type: 'ok'; filePath: string} | {type: 'error'; errorType: ErrorTypes},
  $FixMe
> {
  if (!(yield call(fse.pathExists, params.folderPath))) {
    return {type: 'error', errorType: 'folderDoesntExist'}
  }

  let pathStat
  try {
    pathStat = yield call(fse.stat, params.folderPath)
  } catch (e) {
    console.error(e)
    return {type: 'error', errorType: 'pathUnreadable'}
  }

  if (!pathStat.isDirectory()) {
    return {type: 'error', errorType: 'pathIsNotAFolder'}
  }

  const filePath = path.join(params.folderPath, 'theater.json')
  const state: LBStoreState = yield select()

  if (state.projects.listOfPaths.indexOf(filePath) !== -1) {
    return {type: 'error', errorType: 'projectAlreadyRecognised'}
  }

  if (yield call(fse.pathExists, filePath)) {
    return {type: 'error', errorType: 'theaterDotJsonFileAlreadyExists'}
  }

  const fileContent = JSON.stringify({name: params.name})
  yield call(fse.writeFile, filePath, fileContent, {encoding: 'utf-8'})
  const resultOfRecognise = yield call(recogniseProject, {filePath})
  if (resultOfRecognise.type === 'ok') {
    return {...resultOfRecognise, filePath}
  } else {
    return {type: 'error', errorType: resultOfRecognise.errorType}
  }
}
