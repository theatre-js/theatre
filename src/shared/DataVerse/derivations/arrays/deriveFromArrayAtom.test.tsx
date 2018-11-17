import Ticker from '$shared/DataVerse/Ticker'
import arrayAtom from '$shared/DataVerse/deprecated/atoms/arrayAtom'
import boxAtom from '$shared/DataVerse/deprecated/atoms/boxAtom'
import constant from '$shared/DataVerse/derivations/constant'

describe('DataVerse.derivations.deriveFromArrayAtom', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })
  it('should work', () => {
    const arrayA = arrayAtom(['0', '1'])
    const prefix = boxAtom('(prefix)')

    const d = arrayA.derivedArray().map(s => `(${s})`)
    expect(d.index(0).getValue()).toEqual('(0)')
    arrayA.setIndex(0, '0-1')
    expect(d.index(0).getValue()).toEqual('(0-1)')
    const reducedD = d.reduce(
      (acc: string, cur: string) => constant(acc + cur),
      prefix.derivation(),
    )

    expect(reducedD.getValue()).toEqual('(prefix)(0-1)(1)')
    arrayA.setIndex(0, '0-2')
    expect(reducedD.getValue()).toEqual('(prefix)(0-2)(1)')

    const changes: $FixMe[] = []
    reducedD.changes(ticker).tap(c => {
      changes.push(c)
    })

    arrayA.setIndex(0, '0-3')
    ticker.tick()
    expect(changes).toMatchObject(['(prefix)(0-3)(1)'])
    arrayA.push(['2'])
    ticker.tick()
    expect(changes[1]).toEqual('(prefix)(0-3)(1)(2)')
    prefix.set('(prefix-2)')
    ticker.tick()
    expect(changes[2]).toEqual('(prefix-2)(0-3)(1)(2)')
    expect(d.length()).toEqual(3)

    expect(
      arrayAtom([])
        .derivedArray()
        .reduce((() => {}) as $IntentionalAny, 'blah')
        .getValue(),
    ).toEqual('blah')

    expect(d.toJS().getValue()).toMatchObject(['(0-3)', '(1)', '(2)'])
  })
})
