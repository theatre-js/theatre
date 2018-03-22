import mock from 'mock-fs'
import createNewProject from './createNewProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'
import fs from 'fs-extra'

describe('createNewProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'theater.json': '{}',
      },
      '/foo/baz': {},
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should work for an existing folder', async () => {
    const {task, store} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/baz',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'ok',
      filePath: '/foo/baz/theater.json',
    })
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: ['/foo/baz/theater.json'],
      },
    })
    await expect(fs.exists('/foo/baz/theater.json')).resolves.toBe(true)
  })

  it('should error for a non-existing folder', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/quz',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'folderDoesntExist',
    })
  })

  it('should error for a folder that already has a theater.json file', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'theaterDotJsonFileAlreadyExists',
    })
  })

  it('should error for a non-folder', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar/theater.json',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'pathIsNotAFolder'})
  })

  it("should error for a project that's already recognised", async () => {
    const {task} = await runSingleSaga(function*(): Generator_ {
      yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
      return yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error'})
  })
})
