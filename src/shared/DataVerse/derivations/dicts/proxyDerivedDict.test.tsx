import proxyDerivedDict from './proxyDerivedDict'
import Ticker from '$shared//DataVerse/Ticker'
import dictAtom from '$shared//DataVerse/atoms/dictAtom'

describe('DerivedDictStabilizer', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  it('should work', () => {
    const o = dictAtom({foo: '1'})
    const oD = o.derivedDict()

    const proxy = proxyDerivedDict(oD)
    const d = proxy.prop('foo')

    expect(d.getValue()).toEqual('1')

    const dChanges: Array<string> = []
    d.changes(ticker).tap(c => {
      dChanges.push(c)
    })

    ticker.tick()
    expect(dChanges).toHaveLength(0)

    o.setProp('foo', '1-1')
    expect(dChanges).toHaveLength(0)
    ticker.tick()
    expect(dChanges).toMatchObject(['1-1'])

    const o2 = dictAtom({foo: '2'})
    const o2D = o2.derivedDict()

    proxy.setSource(o2D)
    expect(dChanges).toHaveLength(1)
    ticker.tick()
    expect(dChanges).toMatchObject(['1-1', '2'])
  })
})
