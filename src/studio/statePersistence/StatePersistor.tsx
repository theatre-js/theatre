import {Studio} from '$studio/handy'
import {IStudioStoreState} from '$studio/types'
import {select, take, fork, cancel} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import getProjectState from '$lb/studioStatePersistor/getProjectState.caller'
import {isError} from '$shared/utils/isError'
import {reduceAhistoricState} from '$studio/bootstrap/actions'

export default class StatePersistor {
  _lastPersistedStateInfo: {type: 'pending'} | {type: 'empty'}
  constructor(readonly _studio: Studio) {
    this._lastPersistedStateInfo = {type: 'pending'}
    this._waitForRun()
  }

  async _waitForRun() {
    // @ts-ignore @todo
    await this._studio.store.runSaga(waitUntilPathToProjectIsDefined())

    await this._startSession()
  }

  async _startSession() {
    const pathToProject = this._studio.store.reduxStore.getState()
      .pathToProject as string

    const result = await this._studio._lbCommunicator.request(
      getProjectState({pathToProject}),
    )

    if (isError(result)) {
      // @todo
      console.error(result)
    } else {
      if (result.projectState.type === 'empty') {
        this._lastPersistedStateInfo = {type: 'empty'}
        this._studio.store.reduxStore.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else {
        throw new Error('Implement me @todo')
      }
    }
  }
}

function waitUntilPathToProjectIsDefined(): () => Generator_<string> {
  return function* waitForRun(): Generator_ {
    const errorTask = yield fork(function*(): Generator_ {
      yield delay(200)
      // @todo If the user hasn't called TheaterStudio.run(), we should perhaps
      // show a nice dialog explaining what he/she has to do.
      throw new Error(
        `TheaterStudio.run() wasn't called in a timely fashion. @todo`,
      )
    })
    while (true) {
      const state: IStudioStoreState = yield select()
      if (typeof state.pathToProject === 'string') {
        yield cancel(errorTask)
        return state.pathToProject
      }
      yield take('*')
    }
  }
}
