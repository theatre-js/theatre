import {select, call} from 'redux-saga/effects'
import {LBStoreState} from '$lb/types'
import {getProjectCacheDataOrLoadIfNecessary} from '$lb/studioStatePersistor/sagas'
import {ReturnOf, ErrorsOf} from '$shared/types'
import {PossibleStates} from '$lb/studioStatePersistor/types'
import {isError} from '$shared/utils/isError'

type Params = {
  pathToProject: string
}

type Success = {type: 'Success'; projectState: PossibleStates}
type ProjectNotRecognisedError = {
  type: 'Error'
  errorType: 'projectNotRecognised'
}

type AllPossibleErrors = ProjectNotRecognisedError

type AllPossibleResutls = Success | AllPossibleErrors | ErrorsOf<typeof getProjectCacheDataOrLoadIfNecessary>

export default function* getProjectState(
  params: Params,
): Generator_<AllPossibleResutls> {
  const state: LBStoreState = yield select()
  const pathIsRecognised =
    state.projects.listOfPaths.indexOf(params.pathToProject) !== -1

  if (!pathIsRecognised) {
    const error: ProjectNotRecognisedError = {
      type: 'Error',
      errorType: 'projectNotRecognised',
    }
    return error
  }

  const projectStateOrError: ReturnOf<typeof getProjectCacheDataOrLoadIfNecessary> = yield call(
    getProjectCacheDataOrLoadIfNecessary,
    params.pathToProject,
  )

  if (isError(projectStateOrError)) {
    return projectStateOrError
  } else {
    const result: Success = {type: 'Success', projectState: projectStateOrError.state}
    return result
  }

  // @todo high - ensure that the project data is fully loaded into state.projects.byPath
}
