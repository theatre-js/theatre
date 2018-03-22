import {BrowserWindow} from 'electron'
import {_sendRequestToWindow} from '$src/lb/lfController/sagas'
import {call} from 'redux-saga/effects'

export const callerFromLBToLF = (handlerName: string): any => {
  const fn: any = function*(
    window: BrowserWindow,
    payload: $FixMe,
  ): Generator_<$FixMe> {
    const r: any = yield call(
      _sendRequestToWindow,
      window,
      handlerName,
      payload,
      // @todo set this to 4000
      4000,
      'I promise this call is coming from callerFromLBToLF()',
    )
    return r
  }

  return fn
}
