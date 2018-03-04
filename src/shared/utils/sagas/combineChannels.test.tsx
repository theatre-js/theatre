
import combineChannels from './combineChannels'
import {channel} from 'redux-saga'
import {call, take} from 'redux-saga/effects'
import EventEmitter from 'events'
import channelFromEmitter from './channelFromEmitter'
import dummySagaRunner from './dummySagaRunner'
import wn from 'when'

describe('combineChannels()', () => {
  it('should work', async () => {
    const middleware = dummySagaRunner()
    const emitterA = new EventEmitter()
    const emitterB = new EventEmitter()

    const record = []
    middleware.run(function*(): Generator_<$FixMe, $FixMe, $FixMe> {
      const channelA = yield channelFromEmitter(emitterA, ['a'])
      const channelB = yield channelFromEmitter(emitterB, ['b'])
      const combined = yield call(channel)
      yield combineChannels(combined, [channelA, channelB])

      while (true) {
        record.push(yield take(combined))
      }
    })

    await wn().delay(200)
    expect(record.length).toEqual(0)
    emitterA.emit('a', 'a')
    expect(record[0]).toMatchObject({type: 'a', payload: 'a'})
    emitterB.emit('b', 'b')
    expect(record[1]).toMatchObject({type: 'b', payload: 'b'})
  })
})
