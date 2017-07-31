// @flow
import {fork, call, put, take, select} from 'redux-saga/effects'
import {bootstrapAction} from '$lf/common/actions'
import {getChannelOfRequestsFromMain, sendRequestToMain} from '$shared/utils/sagas/ipcComms/renderer'
import {reduceState} from '$shared/utils'
import {type StoreState} from '$lf/types'

export default function* errorCatchingRootSaga(): Generator<> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator<> {
  yield put(bootstrapAction())
  yield fork(handleRequestsFromMain)
  yield call(getInitialStateFromLB)
}

function* handleRequestsFromMain(): Generator<> {
  const requestsFromLB = yield call(getChannelOfRequestsFromMain)

  while(true) {
    const request = yield take(requestsFromLB)
    if (request.type === 'receiveNewState') {
      yield fork(receiveNewState, request)
    } else {
      throw Error(`Unkown request type received from LB '${request.type}'`)
    }
  }
}

function* receiveNewState(request): Generator<> {
  yield reduceState(['mirrorOfLBState'], () => request.payload)
  yield request.respond('done')
}

function* getInitialStateFromLB(): Generator<> {
  const state: StoreState = yield select()
  if (state.mirrorOfLBState) return
  const result = yield call(sendRequestToMain, 'getCurrentState', null)
  yield reduceState(['mirrorOfLBState'], () => result)
}