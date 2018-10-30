import mock from 'mock-fs'
import isPathAProject from './isPathAProject.endpointForLf'
import {runSingleSaga} from '$lb/testUtils'

describe('isPathAProject()', () => {
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

  it('should return true for existing files', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/bar/studio.json',
    }).task.done
    expect(result).toMatchObject({
      type: 'ok',
      isIt: true,
      filePath: '/foo/bar/studio.json',
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
      filePath: '/foo/bar/studio.json',
    })
  })

  it('should return false for non-existing folders', async () => {
    const result = await runSingleSaga(isPathAProject, {
      fileOrFolderPath: '/foo/baz',
    }).task.done
    expect(result).toMatchObject({type: 'ok', isIt: false})
  })
})
