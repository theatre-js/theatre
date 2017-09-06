// @flow
import Reference from './Reference'

describe('DataVerse.Reference', () => {
  it('should work', () => {
    const r = new Reference('foo')
    expect(r.get()).toEqual('foo')
    r.set('bar')
    expect(r.get()).toEqual('bar')
    const diffs = []
    r.events.addEventListener('diff', (diff) => {
      diffs.push(diff)
    })
    r.set('baz')
    expect(diffs).toHaveLength(1)
    expect(diffs[0]).toMatchObject({address: [], oldValue: 'bar', newValue: 'baz'})
  })
})