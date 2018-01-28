// @flow
import {Channel} from 'redux-saga'
import {fork, take, put} from 'redux-saga/effects'

export default function combineChannels(
  outputChannel: Channel,
  inputChannels: Array<Channel>,
) {
  return fork(function*(): Generator_<$FixMe, $FixMe, $FixMe> {
    yield inputChannels.map(function*(
      inChannel: Channel,
    ): Generator_<$FixMe, $FixMe, $FixMe> {
      while (true) {
        // $FixMe
        const e = yield take(inChannel)
        yield put(outputChannel, e)
      }
    })
  })
}
