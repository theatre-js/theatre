import mock from 'mock-fs'
import recogniseProject from './recogniseProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'

describe('recogniseProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'theater.json': '{}',
      },
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should work for existing theater.json file', async () => {
    const {task, store} = await runSingleSaga(recogniseProject, {
      filePath: '/foo/bar/theater.json',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'ok'})
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: ['/foo/bar/theater.json'],
      },
    })
  })

  it('should error for non-existing theater.json file', async () => {
    const {task} = await runSingleSaga(recogniseProject, {
      filePath: '/non/existing/theater.json',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'fileDoesntExist'})
  })

  it('should error for already-recognized projects', async () => {
    const {task} = await runSingleSaga(function*(): Generator_<
      $FixMe,
      $FixMe,
      $FixMe
    > {
      yield call(recogniseProject, {filePath: '/foo/bar/theater.json'})
      return yield call(recogniseProject, {filePath: '/foo/bar/theater.json'})
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'projectAlreadyRecognised',
    })
  })
})
