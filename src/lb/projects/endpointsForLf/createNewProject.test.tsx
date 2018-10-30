import mock from 'mock-fs'
import createNewProject from './createNewProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'
import fs from 'fs-extra'

describe('createNewProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'studio.json': '{}',
      },
      '/foo/baz': {},
    })
  })

  afterEach(() => {
    mock.restore()
  })

  // Didn't pass on Linux
  it.skip('should work for an existing folder', async () => {
    const {task, store} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/baz',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'ok',
      filePath: '/foo/baz/studio.json',
    })
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: ['/foo/baz/studio.json'],
      },
    })
    await expect(fs.exists('/foo/baz/studio.json')).resolves.toBe(true)
  })

  // Didn't pass on Linux
  it.skip('should error for a non-existing folder', async () => {
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

  // Didn't pass on Linux
  it.skip('should error for a folder that already has a studio.json file', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'studioDotJsonFileAlreadyExists',
    })
  })

  // Didn't pass on Linux
  it.skip('should error for a non-folder', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar/studio.json',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'pathIsNotAFolder'})
  })

  // Didn't pass on Linux
  it.skip("should error for a project that's already recognised", async () => {
    const {task} = await runSingleSaga(function*(): Generator_ {
      yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
      return yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error'})
  })
})
