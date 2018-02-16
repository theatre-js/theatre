import mapValues from './mapValues'
import deriveFromDictAtom from './deriveFromDictAtom'
import Ticker from '$src/shared/DataVerse/Ticker';
import dictAtom from '$src/shared/DataVerse/atoms/dict';
import boxAtom from '$src/shared/DataVerse/atoms/box';

describe('mapValues', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })
  it('should work', () => {
    const o = dictAtom({
      foo: boxAtom('foo'),
      bar: boxAtom('bar'),
    })

    const mapLike = deriveFromDictAtom(o)

    const mapped = mapValues(mapLike, d => d.flatMap(s => s + 'B'))

    const fooD = mapped.prop('foo')
    expect(fooD.getValue()).toEqual('fooB')
    o.prop('foo').set('foo2')
    expect(fooD.getValue()).toEqual('foo2B')

    const fooDChanges = []
    fooD.changes(ticker).tap(c => {
      fooDChanges.push(c)
    })

    o.prop('foo').set('foo3')
    ticker.tick()
    expect(fooDChanges).toMatchObject(['foo3B'])

    const mappedChanges = []
    mapped.changes().tap(c => {
      mappedChanges.push(c)
    })

    o.prop('foo').set('zoo')

    expect(mappedChanges).toHaveLength(0)

    // $FlowIgnore
    o.setProp('doo', boxAtom('blah'))
    expect(mappedChanges).toMatchObject([
      {
        addedKeys: ['doo'],
        deletedKeys: [],
      },
    ])

    expect(
      mapped
        .pointer()
        .prop('foo')
        .getValue(),
    ).toEqual('zooB')
  })
})
