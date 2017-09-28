// @flow
import SimpleDerivation from './SimpleDerivation'
import DerivationOfABoxAtom from './ofAtoms/DerivationOfABoxAtom'
import * as D from '$shared/DataVerse'

const d = (...args) => new SimpleDerivation(...args)
describe('FlattenDeepDerivation', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })
  it('simple case', () => {
    const a = new D.BoxAtom(1)
    const aD = a.derivation()
    const b = new D.BoxAtom(3)
    const bD = b.derivation()
    const f = aD.flatMap((aValue) => bD.map((bValue) => aValue + bValue))
    expect(f.getValue()).toEqual(4)
    a.set(2)
    expect(f.getValue()).toEqual(5)

    const changes = []

    f.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    context.tick()
    expect(changes).toHaveLength(0)
    a.set(3)
    expect(changes).toHaveLength(0)
    context.tick()
    expect(changes).toMatchObject([6])
    b.set(4)
    context.tick()
    expect(changes).toMatchObject([6, 7])
  })

  it('events should work', () => {
    const a = new D.BoxAtom(1)
    const b = new D.BoxAtom(3)
    const aD = new DerivationOfABoxAtom(a)
    const bD = new DerivationOfABoxAtom(b)
    const final = aD.map((n) => bD.map((m) => m + n)).flattenDeep()

    expect(final.getValue()).toEqual(4)
    a.set(2)
    expect(final.getValue()).toEqual(5)

    b.set(4)
    expect(final.getValue()).toEqual(6)

    expect(() => aD.changes()).toThrow()
    const context = new D.Context()

    const adEvents = []
    aD.setDataVerseContext(context)

    aD.changes().tap((newVal) => {
      adEvents.push(newVal)
    })

    expect(adEvents).toHaveLength(0)
    a.set(3)
    expect(adEvents).toHaveLength(0)

    context.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents = []
    final.setDataVerseContext(context)
    final.changes().tap((v) => {finalEvents.push(v)})
    a.set(4)

    expect(finalEvents).toHaveLength(0)
    context.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    b.set(5)
    expect(finalEvents).toHaveLength(1)
    context.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])
  })

  it('more', () => {
    const context = new D.Context()
    const a = new D.BoxAtom('a')
    const aD = a.derivation()
    const b = new D.BoxAtom('b')
    const bD = b.derivation()
    const cD = aD.map((aValue) => bD.map((bValue) => d({}, () => aValue + bValue))).flattenDeep()

    expect(cD.getValue()).toEqual('ab')
    cD.setDataVerseContext(context)
    const changes = []
    cD.changes().tap((c) => {changes.push(c)})

    b.set('bb')
    context.tick()
    expect(changes).toMatchObject(['abb'])
  })

  it('depth', () => {
    const a = new D.BoxAtom(1)
    const b = new D.BoxAtom(3)
    const aD = new DerivationOfABoxAtom(a)
    const bD = new DerivationOfABoxAtom(b)
    expect(aD.map(() => bD).flattenDeep(0).getValue()).toEqual(bD)
    expect(aD.map(() => bD).flattenDeep(1).getValue()).toEqual(3)
  })
  it('blah', () => {
    const a = new D.BoxAtom('a')
    const aD = a.derivation()
    const c = new D.ConstantDerivation(new D.ConstantDerivation(aD))
    const f = c.flattenDeep(3)
    // expect(f.getValue()).toEqual('a')
    // a.set('a2')
    // expect(f.getValue()).toEqual('a2')

    const changes = []
    f.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    a.set('a32')
    a.set('a3')
    context.tick()
    expect(changes).toMatchObject(['a3'])
  })
})