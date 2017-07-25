// @flow
import {take} from 'redux-saga/effects'
import {type Channel} from 'redux-saga'

export default function* takeOnly(channel: Channel, type: string): Generator<> {
  while (true) {
    const {type: eventType, payload} = yield take(channel)
    if (eventType === type) {
      yield payload
    }
  }
}