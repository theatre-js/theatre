// @flow

import SimpleDerivation from './SimpleDerivation'
import DerivationOfABoxAtom from './ofAtoms/DerivationOfABoxAtom'
import * as D from '$shared/DataVerse'

const d = (...args) => new SimpleDerivation(...args)

describe('SimpleDerivation', () => {
  it('should work', () => {
    const a = d({}, () => 1)
    const b = d({}, () => 2)
    const sum = d({a, b}, ({a, b}) => a.getValue() + b.getValue())
    expect(sum.getValue()).toEqual(3)

    const sumSquared = d({sum}, ({sum}) => Math.pow(sum.getValue(), 2))
    expect(sumSquared.getValue()).toEqual(9)

    const sumSquaredTimesTwo = sumSquared.map((s) => s * 2)
    expect(sumSquaredTimesTwo.getValue()).toEqual(18)


  })

  it('should still work', () => {
    const a = d({}, () => 2)
    const b = d({}, () => 3)
    const c = a.flatMap((thisGonnaBeTwo) => d({b}, ({b}) => b.getValue() + thisGonnaBeTwo))
    expect(c.getValue()).toEqual(5)
  })

  it('events should work', (done) => {
    // debugger
    const a = new D.BoxAtom(1)
    const b = new D.BoxAtom(3)
    const aD = new DerivationOfABoxAtom(a)
    const bD = new DerivationOfABoxAtom(b)
    const final = aD.flatMap((n) => bD.map((m) => m + n))

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
    // debugger
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

    done()
  })

  it('more', () => {
    const context = new D.Context()
    const a = new D.BoxAtom('a')
    const aD = a.derivation()
    const b = new D.BoxAtom('b')
    const bD = b.derivation()
    const cD = aD.flatMap((a) => bD.map((b) => a + b))

    expect(cD.getValue()).toEqual('ab')
    cD.setDataVerseContext(context)
    const changes = []
    // debugger
    cD.changes().tap((c) => {changes.push(c)})


    b.set('bb')
    context.tick()
    expect(changes).toMatchObject(['abb'])
  })
})