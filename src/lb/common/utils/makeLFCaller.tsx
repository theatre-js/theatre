import {sendRequestToMain} from '$lf/mirrorOfLBState/sagas/utils'
import {call} from 'redux-saga/effects'

const makeCallerFor = (handlerName: string): any => {
  const fn: any = function*(req: $FixMe): Generator_<$FixMe, $FixMe, $FixMe> {
    const r: any = yield call(sendRequestToMain, handlerName, req)
    return r
  }

  return fn
}

export default makeCallerFor
