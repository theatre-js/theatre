import {Studio} from '$studio/handy'
import {IStudioStoreState, IStudioHistoryState} from '$studio/types'
import jsonPatchLib from 'fast-json-patch'
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

export default class StatePersistor {
  _lastPersistedStateInfo:
    | {type: 'empty'; state: {}}
    | {type: 'full'; checksum: string; state: IStudioHistoryState}

  constructor(readonly _studio: Studio) {
    this._lastPersistedStateInfo = {type: 'empty', state: {}}
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
      const newProjectState = result.projectState
      if (newProjectState.checksum === 'empty') {
        this._lastPersistedStateInfo = {type: 'empty', state: {}}
        this._studio.store.reduxStore.dispatch(
          reduceAhistoricState(['stateIsHydrated'], () => true),
        )
      } else {
        this._lastPersistedStateInfo = {
          type: 'full',
          checksum: newProjectState.checksum,
          state: newProjectState.data as IStudioHistoryState,
        }
        this._studio.store.reduxStore.dispatch(
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
        const state: IStudioStoreState = yield select()
        const history = state['@@history']
        const diffs = jsonPatchLib.compare(
          self._lastPersistedStateInfo.state,
          history,
        )
        if (diffs.length === 0) continue

        const checksum = gneerateUniqueId()

        const resultPromise = self._studio._lbCommunicator.request(
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
      const state: IStudioStoreState = yield select()
      if (typeof state.pathToProject === 'string') {
        yield cancel(errorTask)
        return state.pathToProject
      }
      yield take('*')
    }
  }
}
