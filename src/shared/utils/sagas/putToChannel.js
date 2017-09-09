// @flow
import {put} from 'redux-saga/effects'
import {type Channel} from 'redux-saga'

export default function* putToChannel(channel: Channel, type: string, payload: mixed): Generator<*, *, *> {
  return yield put(channel, {type, payload})
}