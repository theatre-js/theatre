// @flow
import {type Channel} from 'redux-saga'
import {fork, take, put} from 'redux-saga/effects'

export default function* combineChannels(outChannel: Channel, ...inChannels: Array<Channel>): Generator<> {
  yield fork(function* (): Generator<> {
    yield inChannels.map(function* (inChannel: Channel): Generator<> {
      while (true) {
        // $FlowFixMe
        const e = yield take(inChannel)
        yield put(outChannel, e)
      }
    })
  })
}