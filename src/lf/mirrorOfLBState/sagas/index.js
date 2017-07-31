// @flow
import {fork, call, put, take, select} from 'redux-saga/effects'
import {bootstrapAction} from '$lf/common/actions'
import {getChannelOfRequestsFromMain, sendRequestToMain} from './utils'
import {reduceState} from '$shared/utils'
import {type StoreState} from '$lf/types'

export default function* mirrorOfLBStateRootSaga(): Generator<> {
  yield fork(handleRequestsFromMain)
  yield call(getInitialStateFromLB)
  yield put(bootstrapAction())
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
  console.log('req', request)
  yield reduceState(['mirrorOfLBState'], () => request.payload)
  console.log(yield call(request.respond, 'done'))
}

function* getInitialStateFromLB(): Generator<> {
  const state: StoreState = yield select()
  if (state.mirrorOfLBState) return
  const result = yield call(sendRequestToMain, 'getCurrentState', null)
  yield reduceState(['mirrorOfLBState'], () => result)
}