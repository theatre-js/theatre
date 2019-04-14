import withDeps from './withDeps'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import constant from '$shared/DataVerse/derivations/constant'
import Ticker from '$shared/DataVerse/Ticker'
import atom, { valueDerivation } from '$shared/DataVerse/atom';

describe('withDeps', () => {
  it('should work', () => {
    const a = withDeps({}, () => 1)
    const b = withDeps({}, () => 2)
    const sum = withDeps({a, b}, ({a, b}) => a.getValue() + b.getValue())
    expect(sum.getValue()).toEqual(3)

    const sumSquared = withDeps({sum}, ({sum}) => Math.pow(sum.getValue(), 2))
    expect(sumSquared.getValue()).toEqual(9)

    const sumSquaredTimesTwo = sumSquared.map(s => s * 2)
    expect(sumSquaredTimesTwo.getValue()).toEqual(18)
  })

  it('should still work', () => {
    const a = withDeps({}, () => 2)
    const b = withDeps({}, () => 3)
    const c = a.flatMap(
      (thisGonnaBeTwo): AbstractDerivation<number> =>
        withDeps({b}, ({b}) => b.getValue() + thisGonnaBeTwo),
    )
    expect(c.getValue()).toEqual(5)
  })

  it('events should work', done => {
    const a = atom(1)
    const b = atom(3)
    const aD = valueDerivation(a.pointer)
    aD.getValue() as number
    // @ts-ignore expected
    aD.getValue() as string

    const bD = valueDerivation(b.pointer)
    bD.map(m => m + 1).getValue() as number
    // @ts-ignore expected
    bD.map(m => m + 1).getValue() as string
    // @ts-ignore expected
    bD.map((m: string) => m + 'hi')
    bD.flatMap(m => m + 1).getValue() as number
    // @ts-ignore expected
    bD.flatMap(m => m + 1).getValue() as string
    bD.flatMap(m => constant(m + 1)).getValue() as number

    const final = aD.flatMap(
      (n): AbstractDerivation<number> => bD.map(m => m + n),
    )

    expect(final.getValue()).toEqual(4)
    a.setState(2)
    expect(final.getValue()).toEqual(5)

    b.setState(4)
    expect(final.getValue()).toEqual(6)

    // expect(() => aD.changes()).toThrow()
    const ticker = new Ticker()

    const adEvents: number[] = []

    aD.changes(ticker).tap(newVal => {
      adEvents.push(newVal)
    })

    expect(adEvents).toHaveLength(0)
    a.setState(3)
    expect(adEvents).toHaveLength(0)

    ticker.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents: number[] = []
    final.changes(ticker).tap(v => {
      finalEvents.push(v)
    })
    a.setState(4)

    expect(finalEvents).toHaveLength(0)
    ticker.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    b.setState(5)
    expect(finalEvents).toHaveLength(1)
    ticker.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])

    done()
  })

  it('more', () => {
    const ticker = new Ticker()
    const a = atom('a')
    const aD = valueDerivation(a.pointer)
    const b = atom('b')
    const bD = valueDerivation(b.pointer)
    const cD = aD.flatMap(a => bD.map(b => a + b))

    expect(cD.getValue()).toEqual('ab')
    const changes: string[] = []
    cD.changes(ticker).tap(c => {
      changes.push(c)
    })

    b.setState('bb')
    ticker.tick()
    expect(changes).toMatchObject(['abb'])
  })
})
