import box from './box'

describe('DataVerse.atoms.box', () => {
  it('should allow getting and setting values', () => {
    const r = box('foo')
    expect(r.getValue()).toEqual('foo')
    r.set('bar')
    expect(r.getValue()).toEqual('bar')
  })

  it('should correctly report changes', () => {
    const r = box('foo')
    const changes: $FixMe[] = []
    r.changes().tap(change => {
      changes.push(change)
    })
    r.set('bar')
    r.set('bar')
    r.set('baz')

    expect(changes).toHaveLength(3)
    expect(changes).toMatchObject(['bar', 'bar', 'baz'])
  })
})
