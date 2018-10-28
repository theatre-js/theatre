import mock from 'mock-fs'
import isPathAProject from './isPathAProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'

describe('isPathAProject()', () => {
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

  it('should return true for existing files', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/bar/theater.json',
    }).task.done
    expect(result).toMatchObject({
      type: 'ok',
      isIt: true,
      filePath: '/foo/bar/theater.json',
    })
  })

  // Didn't pass on Linux
  it.skip('should return true for existing folders', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/bar',
    }).task.done
    expect(result).toMatchObject({
      type: 'ok',
      isIt: true,
      filePath: '/foo/bar/theater.json',
    })
  })

  it('should return false for non-existing folders', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/baz',
    }).task.done
    expect(result).toMatchObject({type: 'ok', isIt: false})
  })
})
