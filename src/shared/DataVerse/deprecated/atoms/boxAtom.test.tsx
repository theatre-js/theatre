import boxAtom from './boxAtom'

describe('DataVerse.atoms.box', () => {
  it('should allow getting and setting values', () => {
    const r = boxAtom('foo')
    expect(r.getValue()).toEqual('foo')
    r.set('bar')
    expect(r.getValue()).toEqual('bar')
  })

  it('should correctly report changes', () => {
    const r = boxAtom('foo')
    const changes: string[] = []
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
