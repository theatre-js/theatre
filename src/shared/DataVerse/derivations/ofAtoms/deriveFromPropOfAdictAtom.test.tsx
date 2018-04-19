import withDeps from '../withDeps'
import deriveFromPropOfADictAtom from './deriveFromPropOfADictAtom'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import boxAtom from '$shared/DataVerse/atoms/boxAtom'
import Ticker from '$shared/DataVerse/Ticker'

describe('deriveFromPropOfADictAtom', () => {
  it('events should work', done => {
    const m = dictAtom({a: boxAtom(1), b: boxAtom(3)})

    const aD = deriveFromPropOfADictAtom(m, 'a')
    const bD = deriveFromPropOfADictAtom(m, 'b')

    const final = aD
      .map(n => bD.map(m => m.getValue() + n.getValue()))
      .flattenDeep(7)

    expect(final.getValue()).toEqual(4)
    m.setProp('a', boxAtom(2))
    expect(final.getValue()).toEqual(5)

    m.setProp('b', boxAtom(4))
    expect(final.getValue()).toEqual(6)

    const ticker = new Ticker()

    const adEvents: number[] = []

    aD.changes(ticker).tap(newBox => {
      adEvents.push(newBox.getValue())
    })

    expect(adEvents).toHaveLength(0)
    m.setProp('a', boxAtom(3))
    expect(adEvents).toHaveLength(0)

    ticker.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents: number[] = []
    final.changes(ticker).tap(v => {
      finalEvents.push(v)
    })
    m.setProp('a', boxAtom(4))

    expect(finalEvents).toHaveLength(0)
    ticker.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    m.setProp('b', boxAtom(5))
    expect(finalEvents).toHaveLength(1)
    ticker.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])

    done()
  })

  it('more', () => {
    const ticker = new Ticker()
    const a = boxAtom('a')
    const aD = a.derivation()
    const b = boxAtom('b')
    const bD = b.derivation()
    const cD = aD
      .map(aValue => bD.map(bValue => withDeps({}, () => aValue + bValue)))
      .flattenDeep(7)

    expect(cD.getValue()).toEqual('ab')
    const changes: string[] = []
    cD.changes(ticker).tap(c => {
      changes.push(c)
    })

    b.set('bb')
    ticker.tick()
    expect(changes).toMatchObject(['abb'])
  })
  ;(function() {})
})
