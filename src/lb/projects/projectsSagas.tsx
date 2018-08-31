import {select, fork, cancel, put, call, take} from 'redux-saga/effects'
import deepEqual from 'deep-equal'
import {
  ProjectsNamespaceState,
  StuffInTheaterJsonFile,
} from '$src/lb/projects/types'
import {LBStoreState} from '$src/lb/types'
import {Task} from 'redux-saga'
import {omit} from '$shared/utils'
import * as fse from 'fs-extra'
import {reduceStateAction} from '$shared/utils/redux/commonActions'

type ListOfProjectPaths = ProjectsNamespaceState['listOfPaths']

export default function* projectsSaga() {
  let lastListOfProjects: ListOfProjectPaths = []
  const tasksOfObservedPaths: Record<string, $FixMe> = {}

  while (true) {
    const newState = ((yield select()) as LBStoreState).projects
    const newListOfProjects: ListOfProjectPaths = newState.listOfPaths
      .concat([])
      .sort()

    if (!deepEqual(lastListOfProjects, newListOfProjects)) {
      lastListOfProjects = newListOfProjects
      const projectsByPath = newState.byPath
      const covered: Record<string, boolean> = {}
      for (const projectPath of newListOfProjects) {
        if (!projectsByPath[projectPath]) {
          const task = yield fork(servePath, projectPath)
          tasksOfObservedPaths[projectPath] = task
        }

        covered[projectPath] = true
      }

      for (const projectPath of Object.keys(projectsByPath)) {
        if (covered[projectPath] !== true) {
          const taskToCancel = tasksOfObservedPaths[projectPath]
          delete tasksOfObservedPaths[projectPath]
          yield call(cleanupObservedPath, taskToCancel, projectPath)
        }
      }
    }
    yield take('*')
  }
}

function* servePath(projectPath: string) {
  yield put(
    reduceStateAction(['projects', 'byPath', projectPath], () => ({
      loadingState: 'loading',
    })),
  )

  yield call(reflectProjectJsonOntoState, projectPath)
}

function* reflectProjectJsonOntoState(projectPath: string) {
  let jsonString: string

  try {
    jsonString = yield fse.readFile(projectPath, {encoding: 'utf-8'})
  } catch (e) {
    return yield put(
      reduceStateAction(['projects', 'byPath', projectPath], () => ({
        loadingState: 'error',
        errorType: 'fileCantBeRead',
        message: e.message,
      })),
    )
  }

  let jsonParsed: {}
  try {
    jsonParsed = JSON.parse(jsonString)
  } catch (e) {
    return yield put(
      reduceStateAction(['projects', 'byPath', projectPath], () => ({
        loadingState: 'error',
        errorType: 'jsonCantBeParsed',
        message: e.message,
      })),
    )
  }

  // @todo
  function isJsonValid(jsonObject: {}): jsonObject is StuffInTheaterJsonFile {
    return true
  }

  if (!isJsonValid(jsonParsed)) {
    return yield put(
      reduceStateAction(['projects', 'byPath', projectPath], () => ({
        loadingState: 'error',
        errorType: 'invalidJsonSchema',
        message: 'invalidJsonSchema. @todo: give a more detailed error here',
      })),
    )
  } else {
    const newProjectState = {
      loadingState: 'loaded',
      name: jsonParsed.name,
    }

    return yield put(
      reduceStateAction(
        ['projects', 'byPath', projectPath],
        () => newProjectState,
      ),
    )
  }
}

function* cleanupObservedPath(taskToCancel: Task, projectPath: string) {
  yield null
  yield cancel(taskToCancel)
  yield put(
    reduceStateAction(['projects', 'byPath'], byPath =>
      omit(byPath, projectPath),
    ),
  )
}

type ProjectNotRecognisedError = {
  type: 'Error'
  errorType: 'projectNotRecognised'
}

export function* ensureProjectIsRecognised(
  projectPath: string,
): Generator_<'ok'> {
  const state: LBStoreState = yield select()
  const pathIsRecognised =
    state.projects.listOfPaths.indexOf(projectPath) !== -1

  if (!pathIsRecognised) {
    const error: ProjectNotRecognisedError = {
      type: 'Error',
      errorType: 'projectNotRecognised',
    }
    return error
  }

  // @todo ensure that the data from theater.json of that project is also loaded
}
