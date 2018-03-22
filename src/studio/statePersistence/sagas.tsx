import {actionChannel, take, select, call} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import {IStudioStoreState} from '$studio/types'
import { getStudio } from '$studio/bootstrap/rootSaga';
import { Studio } from '$studio/handy';

function* callLBWithoutCredents(): Generator {
   
}

type ReturnOfTheThing =
  | {type: 'Success'; state: $FixMe}
  | {type: 'Error'; errorType: 'ProjectPathNotRecognised'}

function* setProjectPathAndGetState(params: {
  projectPath: string
}): Generator_<mixed, ReturnOfTheThing, mixed> {}

export default function* statePersistenceSaga(): Generator {
  const pathToProject = yield call(waitForPathToProject)
  const studio: Studio = yield getStudio()
  studio._lb
  // const result = yield callLBWithoutCredents(
  //   setProjectPathAndGetState,
  //   pathToProject,
  // )
}

function* waitForPathToProject(): Generator_<$FixMe, string, $FixMe> {
  const ch = yield actionChannel('*', buffers.expanding(200))

  while (true) {
    yield take(ch)
    const state: IStudioStoreState = yield select()
    if (typeof state.pathToProject === 'string') {
      return state.pathToProject
    }
  }
}
