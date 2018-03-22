import {select, call, put} from 'redux-saga/effects'
import {LBStoreState} from '$lb/types'
import {StateWithCacheData, PossibleStates} from '$lb/studioStatePersistor/types'
import * as fs from 'fs-extra'
import {reduceLBState} from '$lb/bootstrap/actions'
import {ErrorsOf} from '$shared/types'

export function* getProjectCacheDataOrLoadIfNecessary(
  pathToProject: string,
): Generator_<ErrorsOf<typeof loadProjectState> | StateWithCacheData> {
  const r = yield call(ensureProjectStateIsLoaded, pathToProject)
  if (r !== 'okay') return r

  return yield call(getProjectCacheData, pathToProject)
}

/**
 * Just a selector. Doesn't load the state from file. Only reads it from redux, if it's already loaded
 */
function* getProjectCacheData(
  pathToProject: string,
): Generator_<StateWithCacheData | undefined> {
  const storeState: LBStoreState = yield select()
  const cachedProjectState: undefined | StateWithCacheData =
    storeState.studioStatePersistor.byPath[pathToProject]

  return cachedProjectState
}

function* ensureProjectStateIsLoaded(
  pathToProject: string,
): Generator_<'okay' | ErrorsOf<typeof loadProjectState>> {
  const storeState: LBStoreState = yield select()
  const cachedProjectState: undefined | StateWithCacheData =
    storeState.studioStatePersistor.byPath[pathToProject]

  if (!cachedProjectState) {
    return yield call(loadProjectState, pathToProject)
  } else {
    return 'okay'
  }
}

function* loadProjectState(
  pathToProject: string,
): Generator_<
  | 'okay'
  | {errorType: 'cantParseJson'; details: mixed}
  | {errorType: 'corruptedData'; details: mixed}
> {
  const pathToStateFile = projectPathToStatePath(pathToProject)
  let state: PossibleStates
  if (yield fs.exists(pathToStateFile)) {
    let json: $FixMe
    try {
      json = yield fs.readJSON(pathToStateFile)
    } catch (e) {
      return {errorType: 'cantParseJson', details: e.message}
    }

    if (typeof json.checksum !== 'string') {
      return {
        errorType: 'corruptedData',
        details: `json file doesn't have a proper checksum`,
      }
    }

    if (typeof json.data !== 'object') {
      return {
        errorType: 'corruptedData',
        details: `json file doesn't have a .data property`,
      }
    }

    state = json
  } else {
    state = {
      checksum: 'empty',
      data: {}
    }
  }

  yield call(cacheProjectState, pathToProject, state)

  return 'okay'
}

export function* cacheProjectState(pathToProject: string, state: PossibleStates) {
  yield put(
    reduceLBState(['studioStatePersistor', 'byPath', pathToProject], () => ({
      ...state,
      lastRead: Date.now(),
    })),
  )
}

export function projectPathToStatePath(pathToProject: string) {
  return pathToProject.replace(/theater\.json$/, 'theater-history.json')
}
