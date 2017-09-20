// @flow
import SimpleDerivation from './SimpleDerivation'
import DerivationOfAPropOfAMapAtom from './DerivationOfAPropOfAMapAtom'
// import DerivationOfAPropOfAMapAtom from './DerivationOfAPropOfAMapAtom'
import * as D from '$shared/DataVerse'

const d = (...args) => new SimpleDerivation(...args)
describe('DerivationOfAPropOfAMapAtom', () => {
  it('events should work', (done) => {
    const m = new D.MapAtom({a: new D.BoxAtom(1), b: new D.BoxAtom(3)})

    const aD = new DerivationOfAPropOfAMapAtom(m, 'a')
    const bD = new DerivationOfAPropOfAMapAtom(m, 'b')
    const final = aD.map((n) => bD.map((m) => m.unbox() + n.unbox())).flattenDeep()

    expect(final.getValue()).toEqual(4)
    m.setProp('a', new D.BoxAtom(2))
    expect(final.getValue()).toEqual(5)

    m.setProp('b', new D.BoxAtom(4))
    expect(final.getValue()).toEqual(6)

    expect(() => aD.changes()).toThrow()
    const context = new D.Context()

    const adEvents = []
    aD.setDataVerseContext(context)

    aD.changes().tap((newBox) => {
      adEvents.push(newBox.unbox())
    })

    expect(adEvents).toHaveLength(0)
    m.setProp('a', new D.BoxAtom(3))
    expect(adEvents).toHaveLength(0)

    context.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents = []
    final.setDataVerseContext(context)
    final.changes().tap((v) => {finalEvents.push(v)})
    m.setProp('a', new D.BoxAtom(4))

    expect(finalEvents).toHaveLength(0)
    context.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    m.setProp('b', new D.BoxAtom(5))
    expect(finalEvents).toHaveLength(1)
    context.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])

    done()
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
})