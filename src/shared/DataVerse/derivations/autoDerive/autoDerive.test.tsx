import autoDerive, {AutoDerivation} from './autoDerive'
import Ticker from '$shared/DataVerse/Ticker'
import constant from '$shared/DataVerse/derivations/constant'
import atom, {val} from '$shared/DataVerse/atom'

describe('autoDerive', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  it('should work', () => {
    const o = atom({foo: 'foo'})
    const d = new AutoDerivation(() => {
      return val(o.pointer.foo) + 'boo'
    })
    expect(d.getValue()).toEqual('fooboo')

    const changes: Array<typeof d.ChangeType> = []
    d.changes(ticker).tap(c => {
      changes.push(c)
    })

    o.reduceState(['foo'], () => 'foo2')
    ticker.tick()
    expect(changes).toMatchObject(['foo2boo'])
  })
  it('should only collect immediate dependencies', () => {
    const aD = constant(1)
    const bD = aD.map(v => v * 2)
    const cD = autoDerive(() => {
      return bD.getValue()
    })
    expect(cD.getValue()).toEqual(2)
    expect(cD._dependencies.size).toEqual(1)
  })
})
