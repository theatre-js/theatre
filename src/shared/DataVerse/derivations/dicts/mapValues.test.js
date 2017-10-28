// @flow
import mapValues from './mapValues'
import deriveFromDictAtom from './deriveFromDictAtom'
import * as D from '$shared/DataVerse'

describe('mapValues', () => {
  let ticker
  beforeEach(() => {
    ticker = new D.Ticker()
  })
  it('should work', () => {
    const o = D.atoms.dict({
      foo: D.atoms.box('foo'),
      bar: D.atoms.box('bar'),
    })

    const mapLike = deriveFromDictAtom(o)

    const mapped = mapValues(mapLike, (d) => d.flatMap((s) => s + 'B'))

    const fooD = mapped.prop('foo')
    expect(fooD.getValue()).toEqual('fooB')
    o.prop('foo').set('foo2')
    expect(fooD.getValue()).toEqual('foo2B')

    const fooDChanges = []
    fooD.changes(ticker).tap((c) => {
      fooDChanges.push(c)
    })

    o.prop('foo').set('foo3')
    ticker.tick()
    expect(fooDChanges).toMatchObject(['foo3B'])

    const mappedChanges = []
    mapped.changes().tap((c) => {
      mappedChanges.push(c)
    })

    o.prop('foo').set('zoo')

    expect(mappedChanges).toHaveLength(0)

    // $FlowIgnore
    o.setProp('doo', D.atoms.box('blah'))
    expect(mappedChanges).toMatchObject([{
      addedKeys: ['doo'],
      deletedKeys: [],
    }])

    expect(mapped.pointer().prop('foo').getValue()).toEqual('zooB')
  })
})