import {call} from 'redux-saga/effects'
import {getProjectCacheDataOrLoadIfNecessary} from '$lb/studioStatePersistor/sagas'
import {ReturnOf, ErrorsOf} from '$shared/types'
import {PossibleStates} from '$lb/studioStatePersistor/types'
import {isError} from '$shared/utils/isError'
import {ensureProjectIsRecognised} from '$lb/projects/projectsSagas'

type Params = {
  pathToProject: string
}

type Success = {projectState: PossibleStates}

type AllPossibleResutls =
  | Success
  | ErrorsOf<typeof ensureProjectIsRecognised>
  | ErrorsOf<typeof getProjectCacheDataOrLoadIfNecessary>

export default function* getProjectState(
  params: Params,
): Generator_<AllPossibleResutls> {
  const er1 = yield call(ensureProjectIsRecognised, params.pathToProject)
  if (isError(er1)) {
    return er1
  }

  const projectStateOrError: ReturnOf<
    typeof getProjectCacheDataOrLoadIfNecessary
  > = yield call(getProjectCacheDataOrLoadIfNecessary, params.pathToProject)

  if (isError(projectStateOrError)) {
    return projectStateOrError
  } else {
    const {lastRead: _, ...projectState} = projectStateOrError
    const result: Success = {projectState}
    return result
  }

  // @todo high - ensure that the project data is fully loaded into state.projects.byPath
}
