import jiff from 'jiff'
import {ITheaterStoreState, ITheaterHistoryState} from '$theater/types'
import {select, take, fork, cancel, actionChannel} from 'redux-saga/effects'
import {delay, buffers} from 'redux-saga'
import getProjectState from '$lb/studioStatePersistor/getProjectState.caller'
import {isError} from '$shared/utils/isError'
import {reduceAhistoricState} from '$theater/bootstrap/actions'
import pushDiffForProjectState from '$lb/studioStatePersistor/pushDiffForProjectState.caller'
import {PromiseValue} from '$shared/types'
import gneerateUniqueId from 'uuid/v4'
import {replaceHistoryAction} from '$shared/utils/redux/withHistory/actions'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'
import Theater from '$theater/bootstrap/Theater'

export default class StatePersistor {
  _lastPersistedStateInfo:
    | {type: 'empty'; state: {}}
    | {type: 'full'; checksum: string; state: ITheaterHistoryState}

  constructor(readonly _theater: Theater) {
    this._lastPersistedStateInfo = {type: 'empty', state: {}}
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.devSpecific.theater.statePersistenceMode &&
      process.env.devSpecific.theater.statePersistenceMode !== 'normal'
    ) {
      if (
        process.env.devSpecific.theater.statePersistenceMode ===
        'dontLoadOrPersist'
      ) {
        this._theater.store.reduxStore.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else if (
        process.env.devSpecific.theater.statePersistenceMode ===
        'loadButDontUpdate'
      ) {
        throw new Error('Implement me @todo')
      }
    } else {
      this._waitForRun()
    }
  }

  async _waitForRun() {
    // @ts-ignore @todo
    await this._theater.store.runSaga(waitUntilPathToProjectIsDefined())

    await this._startSession()
  }

  async _startSession() {
    const pathToProject = this._theater.store.reduxStore.getState()
      .pathToProject as string

    const result = await this._theater._lbCommunicator.request(
      getProjectState({pathToProject}),
    )

    if (isError(result)) {
      // @todo
      console.error(result)
    } else {
      const newProjectState = result.projectState
      if (newProjectState.checksum === 'empty') {
        this._lastPersistedStateInfo = {type: 'empty', state: {}}
        this._theater.store.reduxStore.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else {
        this._lastPersistedStateInfo = {
          type: 'full',
          checksum: newProjectState.checksum,
          state: newProjectState.data as ITheaterHistoryState,
        }
        this._theater.store.reduxStore.dispatch(
          batchedAction([
            replaceHistoryAction(newProjectState.data as $FixMe),
            reduceAhistoricState(['stateIsHydrated'], () => true),
          ]),
        )
      }
      this._startPersisting()
    }
  }

  _startPersisting() {
    const self = this
    this._theater.store.runSaga(function* startPersisting(): Generator_ {
      const ch = yield actionChannel('*', buffers.sliding(1))

      while (true) {
        yield take(ch)
        const state: ITheaterStoreState = yield select()
        const history = state['@@history']
        const diffs = jiff.diff(
          self._lastPersistedStateInfo.state,
          history,
        )
        if (diffs.length === 0) continue

        const checksum = gneerateUniqueId()

        const resultPromise = self._theater.studio._lbCommunicator.request(
          pushDiffForProjectState({
            prevChecksum:
              self._lastPersistedStateInfo.type === 'empty'
                ? 'empty'
                : self._lastPersistedStateInfo.checksum,
            newChecksum: checksum,
            diffs,
            pathToProject: state.pathToProject as string,
          }),
        )

        const result: PromiseValue<typeof resultPromise> = yield resultPromise

        if (result === 'ok') {
          self._lastPersistedStateInfo = {
            type: 'full',
            state: history,
            checksum,
          }
        } else {
          // @todo high
          console.error(result)
        }
      }
    })
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
      const state: ITheaterStoreState = yield select()
      if (typeof state.pathToProject === 'string') {
        yield cancel(errorTask)
        return state.pathToProject
      }
      yield take('*')
    }
  }
}
