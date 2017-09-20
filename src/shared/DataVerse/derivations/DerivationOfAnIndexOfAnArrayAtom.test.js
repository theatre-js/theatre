// @flow
import DerivationOfAnIndexOfAnArrayAtom from './DerivationOfAnIndexOfAnArrayAtom'
import * as D from '$shared/DataVerse'

describe('DerivationOfAnIndexOfAnArrayAtom', () => {
  it.only('should work', () => {
    const originals = [new D.BoxAtom(0), new D.BoxAtom(1), new D.BoxAtom(2), new D.BoxAtom(3), new D.BoxAtom(4)]
    const a = new D.ArrayAtom(originals)
    const context = new D.Context()
    const index3 = new DerivationOfAnIndexOfAnArrayAtom(a, 3)
    index3.setDataVerseContext(context)
    const changes = []
    index3.changes().tap((c) => {changes.push(c)})

    a.setIndex(0, new D.BoxAtom(('01s': $FixMe)))
    a.setIndex(4, new D.BoxAtom(41))
    context.tick()
    expect(changes).toHaveLength(0)
    a.setIndex(3, new D.BoxAtom(31))
    context.tick()
    expect(changes).toHaveLength(1)
    a.splice(2, 1, [])
    context.tick()
    expect(changes).toHaveLength(2)
    a.splice(2, 0, [new D.BoxAtom(('blah': $FixMe))])
    context.tick()
    expect(changes).toHaveLength(3)

    // expect(changes[0]).toEqual(a.index(0))
  })
})