
import {put} from 'redux-saga/effects'
import {Channel} from 'redux-saga'

export default function* putToChannel(
  channel: Channel,
  type: string,
  payload: mixed,
): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield put(channel, {type, payload})
}
