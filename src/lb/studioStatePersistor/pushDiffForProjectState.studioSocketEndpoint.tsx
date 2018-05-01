import {ensureProjectIsRecognised} from '$lb/projects/projectsSagas'
import {call} from 'redux-saga/effects'
import {isError} from '$shared/utils/isError'
import {
  getProjectCacheDataOrLoadIfNecessary,
  projectPathToStatePath,
  cacheProjectState,
} from '$lb/studioStatePersistor/sagas'
import patch from 'json-touch-patch'
import {ReturnOf} from '$shared/types'
import * as fs from 'fs-extra'

type Result =
  | 'ok'
  | {errorType: 'checksumMismatch'; oldChecksum: string}
  | {errorType: `couldntWriteToJsonFile`; details: string}

export default function* pushDiffForProjectState(params: {
  pathToProject: string
  prevChecksum: 'empty' | string
  newChecksum: string
  diffs: Operation[]
}): Generator_<Result> {
  const er1 = yield call(ensureProjectIsRecognised, params.pathToProject)
  if (isError(er1)) {
    return er1
  }

  const projectStateOrError: ReturnOf<
    typeof getProjectCacheDataOrLoadIfNecessary
  > = yield call(getProjectCacheDataOrLoadIfNecessary, params.pathToProject)

  if (isError(projectStateOrError)) {
    return projectStateOrError
  }

  const existingState = projectStateOrError

  if (params.prevChecksum !== existingState.checksum) {
    return {errorType: 'checksumMismatch', oldChecksum: existingState.checksum}
  }

  const newData = patch(existingState.data, params.diffs)
  const newState = {checksum: params.newChecksum, data: newData}

  const pathToStateFile = projectPathToStatePath(params.pathToProject)
  console.log(pathToStateFile);
  

  try {
    yield fs.writeJSON(pathToStateFile, newState)
  } catch (e) {
    return {errorType: `couldntWriteToJsonFile`, details: e.message}
  }

  yield call(cacheProjectState, params.pathToProject, newState)

  return 'ok'
}
