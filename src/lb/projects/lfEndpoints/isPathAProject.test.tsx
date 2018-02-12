import mock from 'mock-fs'
import isPathAProject from './isPathAProject.lfEndpoint'
import {runSingleSaga} from '$lb/testUtils'

describe('isPathAProject()', () => {
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

  it('should return true for existing files', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/bar/theaterjs.json',
    }).task.done
    expect(result).toMatchObject({
      type: 'ok',
      isIt: true,
      filePath: '/foo/bar/theaterjs.json',
    })
  })

  it('should return true for existing folders', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/bar',
    }).task.done
    expect(result).toMatchObject({
      type: 'ok',
      isIt: true,
      filePath: '/foo/bar/theaterjs.json',
    })
  })

  it('should return false for non-existing folders', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/baz',
    }).task.done
    expect(result).toMatchObject({type: 'ok', isIt: false})
  })
})
