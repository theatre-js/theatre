import {runSingleSaga} from '$lb/testUtils'
import mock from 'mock-fs'
import {_loadState, pathToPersistenceFile} from './sagas'

describe(`statePersistor/sagas`, () => {
  describe(`_loadState()`, () => {
    it(`should just bootstrap when no persistence file exists`, async () => {
      mock({})

      const {task, store} = await runSingleSaga(_loadState)

      await task.done
      expect(store.reduxStore.getState().common.temp.bootstrapped).toEqual(true)

      mock.restore()
    })

    it(`should just load the state if persistence file does exist`, async () => {
      const persistedStuff = {
        projects: {listOfPaths: ['foo/bar/theater.json']}, // this should be loaded into the state
        extraneous: 'blah', // this shouldn't be loaded into the state
      }
      mock({
        [pathToPersistenceFile]: JSON.stringify(persistedStuff),
      })

      const {task, store} = await runSingleSaga(_loadState)

      await task.done
      mock.restore()

      const newState = store.reduxStore.getState()
      expect(newState.common.temp.bootstrapped).toEqual(true)
      expect(newState).toMatchObject(persistedStuff)
    })
  })
})
