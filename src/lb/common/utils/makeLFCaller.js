// @flow
import {sendRequestToMain} from '$lf/mirrorOfLBState/sagas/utils'
import {call} from 'redux-saga/effects'

const makeCallerFor = (handlerName: string): any => {
  const fn: any = function*(req): Generator_<*, *, *> {
    const r: any = yield call(sendRequestToMain, handlerName, req)
    return r
  }

  // fn.name = handlerName

  return fn
}

export default makeCallerFor
