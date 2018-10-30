import mock from 'mock-fs'
import unrecogniseProject from './unrecogniseProject.endpointForLf'
import recogniseProject from './recogniseProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'

describe('unrecogniseProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'studio.json': '{}',
      },
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should work for recognised paths', async () => {
    const {task, store} = await runSingleSaga(function*(): Generator_ {
      yield call(recogniseProject, {filePath: '/foo/bar/studio.json'})
      return yield call(unrecogniseProject, {
        filePath: '/foo/bar/studio.json',
      })
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'ok'})
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: [],
      },
    })
  })

  it('should error for non-recognised paths', async () => {
    const {task} = await runSingleSaga(function*(): Generator_ {
      yield call(recogniseProject, {filePath: '/foo/bar/studio.json'})
      return yield call(unrecogniseProject, {
        filePath: '/non/existing/studio.json',
      })
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'projectNotRecognised',
    })
  })
})
