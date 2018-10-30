import mock from 'mock-fs'
import recogniseProject from './recogniseProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'

describe('recogniseProject()', () => {
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

  it('should work for existing studio.json file', async () => {
    const {task, store} = await runSingleSaga(recogniseProject, {
      filePath: '/foo/bar/studio.json',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'ok'})
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: ['/foo/bar/studio.json'],
      },
    })
  })

  it('should error for non-existing studio.json file', async () => {
    const {task} = await runSingleSaga(recogniseProject, {
      filePath: '/non/existing/studio.json',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'fileDoesntExist'})
  })

  it('should error for already-recognized projects', async () => {
    const {task} = await runSingleSaga(function*(): Generator_ {
      yield call(recogniseProject, {filePath: '/foo/bar/studio.json'})
      return yield call(recogniseProject, {filePath: '/foo/bar/studio.json'})
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'projectAlreadyRecognised',
    })
  })
})
