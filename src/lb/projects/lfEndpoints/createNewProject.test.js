// @flow
import mock from 'mock-fs'
import createNewProject from './createNewProject.lfEndpoint'
import {runSingleSaga} from '$lb/testUtils'
import {call} from 'redux-saga/effects'
import fs from 'fs-extra'

describe('createNewProject()', () => {
  beforeEach(() => {
    mock({
      '/foo/bar': {
        'theaterjs.json': '{}',
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
      filePath: '/foo/baz/theaterjs.json',
    })
    expect(store.reduxStore.getState()).toMatchObject({
      projects: {
        listOfPaths: ['/foo/baz/theaterjs.json'],
      },
    })
    await expect(fs.exists('/foo/baz/theaterjs.json')).resolves.toBe(true)
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

  it('should error for a folder that already has a theaterjs.json file', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({
      type: 'error',
      errorType: 'theaterjsDotJsonFileAlreadyExists',
    })
  })

  it('should error for a non-folder', async () => {
    const {task} = await runSingleSaga(createNewProject, {
      folderPath: '/foo/bar/theaterjs.json',
      name: 'baz',
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error', errorType: 'pathIsNotAFolder'})
  })

  it("should error for a project that's already recognised", async () => {
    const {task} = await runSingleSaga(function*(): Generator_<*, *, *> {
      yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
      return yield call(createNewProject, {folderPath: '/foo/bar', name: 'baz'})
    })
    const result = await task.done
    expect(result).toMatchObject({type: 'error'})
  })
})
