import mapValues from './mapValues'
import deriveFromDictAtom from './deriveFromDictAtom'
import Ticker from '$shared/DataVerse/Ticker'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import boxAtom from '$shared/DataVerse/atoms/boxAtom'
import {DerivedDictChangeType} from './AbstractDerivedDict'

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

    const mapped = mapValues(mapLike, s => s + 'B')

    const fooD = mapped.prop('foo')
    expect(fooD.getValue()).toEqual('fooB')
    o.prop('foo').set('foo2')
    expect(fooD.getValue()).toEqual('foo2B')

    const fooDChanges: string[] = []
    fooD.changes(ticker).tap(c => {
      fooDChanges.push(c)
    })

    o.prop('foo').set('foo3')
    ticker.tick()
    expect(fooDChanges).toMatchObject(['foo3B'])

    const mappedChanges: {
      addedKeys: string[]
      deletedKeys: string[]
    }[] = []
    mapped.changes().tap((c: DerivedDictChangeType<$IntentionalAny>) => {
      mappedChanges.push(c)
    })

    o.prop('foo').set('zoo')

    expect(mappedChanges).toHaveLength(0)

    // @ts-ignore expected
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
