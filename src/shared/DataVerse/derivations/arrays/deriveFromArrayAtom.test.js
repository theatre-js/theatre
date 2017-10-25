// @flow
import * as D from '$shared/DataVerse'

describe('DataVerse.derivations.deriveFromArrayAtom', () => {
  let context
  beforeEach(() => {context = new D.Context()})
  it('should work', () => {
    const arrayAtom = D.atoms.array(['0', '1'])
    const prefix = D.atoms.box('(prefix)')
    // $FixMe
    const d = arrayAtom.derivedArray().map((sD) => sD.map((s) => `(${s})`))
    expect(d.index(0).getValue()).toEqual('(0)')
    arrayAtom.setIndex(0, '0-1')
    expect(d.index(0).getValue()).toEqual('(0-1)')
    const reducedD = d.reduce(
      (acc: string, cur: string) => acc + cur,
      prefix.derivation(),
    )

    expect(reducedD.getValue()).toEqual('(prefix)(0-1)(1)')
    arrayAtom.setIndex(0, '0-2')
    expect(reducedD.getValue()).toEqual('(prefix)(0-2)(1)')

    const changes = []
    reducedD.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    arrayAtom.setIndex(0, '0-3')
    context.tick()
    expect(changes).toMatchObject(['(prefix)(0-3)(1)'])
    arrayAtom.push(['2'])
    context.tick()
    expect(changes[1]).toEqual('(prefix)(0-3)(1)(2)')
    prefix.set('(prefix-2)')
    context.tick()
    expect(changes[2]).toEqual('(prefix-2)(0-3)(1)(2)')
    expect(d.length()).toEqual(3)

    expect(D.atoms.array([]).derivedArray().reduce(() => {}, 'blah').getValue()).toEqual('blah')

    expect(d.toJS().getValue()).toMatchObject(['(0-3)', '(1)', '(2)'])
  })
})