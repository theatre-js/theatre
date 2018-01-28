// @flow
import mock from 'mock-fs'
import unrecogniseProject from './unrecogniseProject.lfEndpoint'
import recogniseProject from './recogniseProject.lfEndpoint'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'

describe('unrecogniseProject()', () => {
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

  it('should work for recognised paths', async () => {
    const {task, store} = await runSingleSaga(function*(): Generator_<
      $FixMe,
      $FixMe,
      $FixMe
    > {
      yield call(recogniseProject, {filePath: '/foo/bar/theaterjs.json'})
      return yield call(unrecogniseProject, {
        filePath: '/foo/bar/theaterjs.json',
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
    const {task} = await runSingleSaga(function*(): Generator_<
      $FixMe,
      $FixMe,
      $FixMe
    > {
      yield call(recogniseProject, {filePath: '/foo/bar/theaterjs.json'})
      return yield call(unrecogniseProject, {
        filePath: '/non/existing/theaterjs.json',
      })
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'projectNotRecognised',
    })
  })
})
