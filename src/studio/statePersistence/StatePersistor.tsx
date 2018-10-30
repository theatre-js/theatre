import jiff from 'jiff'
import {ITheatreStoreState, ITheatreHistoryState} from '$studio/types'
import {select, take, fork, cancel, actionChannel} from 'redux-saga/effects'
import {delay, buffers} from 'redux-saga'
import getProjectState from '$lb/studioStatePersistor/getProjectState.caller'
import {isError} from '$shared/utils/isError'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import pushDiffForProjectState from '$lb/studioStatePersistor/pushDiffForProjectState.caller'
import {PromiseValue} from '$shared/types'
import gneerateUniqueId from 'uuid/v4'
import {replaceHistoryAction} from '$shared/utils/redux/withHistory/actions'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'
import Theatre from '$studio/bootstrap/Theatre'

export default class StatePersistor {
  _lastPersistedStateInfo:
    | {type: 'empty'; state: {}}
    | {type: 'full'; checksum: string; state: ITheatreHistoryState}

  constructor(readonly _studio: Theatre) {
    this._lastPersistedStateInfo = {type: 'empty', state: {}}
    if (
      $env.NODE_ENV === 'development' &&
      $env.devSpecific.studio.statePersistenceMode &&
      $env.devSpecific.studio.statePersistenceMode !== 'normal'
    ) {
      if (
        $env.devSpecific.studio.statePersistenceMode === 'dontLoadOrPersist'
      ) {
        this._studio.store.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else if (
        $env.devSpecific.studio.statePersistenceMode === 'loadButDontUpdate'
      ) {
        throw new Error('Implement me @todo')
      }
    } else {
      this._waitForRun()
    }
  }

  async _waitForRun() {
    // @ts-ignore @todo
    await this._studio.store.runSaga(waitUntilPathToProjectIsDefined())

    await this._startSession()
  }

  async _startSession() {
    const pathToProject = this._studio.store.getState().pathToProject as string

    const result = await this._studio._lbCommunicator.request(
      getProjectState({pathToProject}),
    )

    if (isError(result)) {
      // @todo
      console.error(result)
    } else {
      const newProjectState = result.projectState
      if (newProjectState.checksum === 'empty') {
        this._lastPersistedStateInfo = {type: 'empty', state: {}}
        this._studio.store.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else {
        this._lastPersistedStateInfo = {
          type: 'full',
          checksum: newProjectState.checksum,
          state: newProjectState.data as ITheatreHistoryState,
        }
        this._studio.store.dispatch(
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
    this._studio.store.runSaga(function* startPersisting(): Generator_ {
      const ch = yield actionChannel('*', buffers.sliding(1))

      while (true) {
        yield take(ch)
        const state: ITheatreStoreState = yield select()
        const history = state['@@history']
        const diffs = jiff.diff(self._lastPersistedStateInfo.state, history)
        if (diffs.length === 0) continue

        const checksum = gneerateUniqueId()

        const resultPromise = self._studio.studio._lbCommunicator.request(
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
      // @todo If the user hasn't called TheatreStudio.run(), we should perhaps
      // show a nice dialog explaining what he/she has to do.
      throw new Error(
        `TheatreStudio.run() wasn't called in a timely fashion. @todo`,
      )
    })
    while (true) {
      const state: ITheatreStoreState = yield select()
      if (typeof state.pathToProject === 'string') {
        yield cancel(errorTask)
        return state.pathToProject
      }
      yield take('*')
    }
  }
}
