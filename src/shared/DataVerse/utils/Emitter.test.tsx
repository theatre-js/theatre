import Emitter from './Emitter'

describe.only('DataVerse.Emitter', () => {
  it('should work', () => {
    const e: Emitter<string> = new Emitter()
    e.emit('no one will see this')
    e.emit('nor this')

    const tappedEvents = []
    const untap = e.tappable.tap(payload => {
      tappedEvents.push(payload)
    })
    e.emit('foo')
    e.emit('bar')
    untap()
    e.emit('baz')
    expect(tappedEvents).toMatchObject(['foo', 'bar'])
  })
})
