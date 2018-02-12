import * as D from '$shared/DataVerse'
import Ticker from '$src/shared/DataVerse/Ticker'

describe('DataVerse.derivations.deriveFromArrayAtom', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new D.Ticker()
  })
  it('should work', () => {
    const arrayAtom = D.atoms.array(['0', '1'])
    const prefix = D.atoms.box('(prefix)')

    const d = arrayAtom.derivedArray().map(sD => sD.map(s => `(${s})`))
    expect(d.index(0).getValue()).toEqual('(0)')
    arrayAtom.setIndex(0, '0-1')
    expect(d.index(0).getValue()).toEqual('(0-1)')
    const reducedD = d.reduce(
      (acc: string, cur: string) => D.derivations.constant(acc + cur),
      prefix.derivation(),
    )

    expect(reducedD.getValue()).toEqual('(prefix)(0-1)(1)')
    arrayAtom.setIndex(0, '0-2')
    expect(reducedD.getValue()).toEqual('(prefix)(0-2)(1)')

    const changes: $FixMe[] = []
    reducedD.changes(ticker).tap(c => {
      changes.push(c)
    })

    arrayAtom.setIndex(0, '0-3')
    ticker.tick()
    expect(changes).toMatchObject(['(prefix)(0-3)(1)'])
    arrayAtom.push(['2'])
    ticker.tick()
    expect(changes[1]).toEqual('(prefix)(0-3)(1)(2)')
    prefix.set('(prefix-2)')
    ticker.tick()
    expect(changes[2]).toEqual('(prefix-2)(0-3)(1)(2)')
    expect(d.length()).toEqual(3)

    expect(
      D.atoms
        .array([])
        .derivedArray()
        .reduce(() => {}, 'blah')
        .getValue(),
    ).toEqual('blah')

    expect(d.toJS().getValue()).toMatchObject(['(0-3)', '(1)', '(2)'])
  })
})
