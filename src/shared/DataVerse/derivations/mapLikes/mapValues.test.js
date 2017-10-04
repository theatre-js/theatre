// @flow
import mapValues from './mapValues'
import derivedMapOfMapAtom from './derivedMapOfMapAtom'
import * as D from '$shared/DataVerse'

describe('mapValues', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })
  it('should work', () => {
    const o = new D.MapAtom({
      foo: new D.BoxAtom('foo'),
      bar: new D.BoxAtom('bar'),
    })

    const mapLike = derivedMapOfMapAtom(o)

    const mapped = mapValues(mapLike, (st: string) => st + 'B')

    const fooD = mapped.prop('foo')
    expect(fooD.getValue()).toEqual('fooB')
    o.prop('foo').set('foo2')
    expect(fooD.getValue()).toEqual('foo2B')

    const fooDChanges = []
    fooD.setDataVerseContext(context).changes().tap((c) => {
      fooDChanges.push(c)
    })

    o.prop('foo').set('foo3')
    context.tick()
    expect(fooDChanges).toMatchObject(['foo3B'])

    const mappedChanges = []
    mapped.changes().tap((c) => {
      mappedChanges.push(c)
    })

    o.prop('foo').set('zoo')

    expect(mappedChanges).toHaveLength(0)

    // $FlowIgnore
    o.setProp('doo', new D.BoxAtom('blah'))
    expect(mappedChanges).toMatchObject([{
      addedKeys: ['doo'],
      deletedKeys: [],
    }])
  })
})