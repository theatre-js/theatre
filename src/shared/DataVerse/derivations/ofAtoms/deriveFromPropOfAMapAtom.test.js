// @flow
import withDeps from '../withDeps'
import deriveFromPropOfAMapAtom from './deriveFromPropOfAMapAtom'
// import deriveFromPropOfAMapAtom from './deriveFromPropOfAMapAtom'
import * as D from '$shared/DataVerse'

describe('deriveFromPropOfAMapAtom', () => {
  it('events should work', (done) => {
    const m = new D.MapAtom({a: new D.BoxAtom(1), b: new D.BoxAtom(3)})

    const aD = deriveFromPropOfAMapAtom(m, 'a')
    const bD = deriveFromPropOfAMapAtom(m, 'b')
    const final = aD.map((n) => bD.map((m) => m.getValue() + n.getValue())).flattenDeep(7)

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
      adEvents.push(newBox.getValue())
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
    const cD = aD.map((aValue) => bD.map((bValue) => withDeps({}, () => aValue + bValue))).flattenDeep(7)

    expect(cD.getValue()).toEqual('ab')
    cD.setDataVerseContext(context)
    const changes = []
    cD.changes().tap((c) => {changes.push(c)})

    b.set('bb')
    context.tick()
    expect(changes).toMatchObject(['abb'])
  });

  (function() {

  })
})