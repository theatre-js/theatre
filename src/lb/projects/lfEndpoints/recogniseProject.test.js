// @flow
import mock from 'mock-fs'
import recogniseProject from './recogniseProject.lfEndpoint'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'

describe('recogniseProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'theaterjs.json': '{}',
      },
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should work for existing theaterjs.json file', async () => {
    const {task, store} = await runSingleSaga(recogniseProject, {filePath: '/foo/bar/theaterjs.json'})
    const result = await task.done
    expect(result).toMatchObject({type: 'ok'})
    expect(store.reduxStore.getState()).toMatchObject({projects: {
      listOfPaths: ['/foo/bar/theaterjs.json'],
    }})
  })

  it('should error for non-existing theaterjs.json file', async () => {
    const {task} = await runSingleSaga(recogniseProject, {filePath: '/non/existing/theaterjs.json'})
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'fileDoesntExist'})
  })

  it('should error for already-recognized projects', async () => {
    const {task} = await runSingleSaga(function* (): Generator<*, *, *> {
      yield call(recogniseProject, {filePath: '/foo/bar/theaterjs.json'})
      return yield call(recogniseProject, {filePath: '/foo/bar/theaterjs.json'})
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'projectAlreadyRecognised'})
  })
})