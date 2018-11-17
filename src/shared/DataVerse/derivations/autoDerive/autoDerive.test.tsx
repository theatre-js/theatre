import autoDerive, {AutoDerivation} from './autoDerive'
import Ticker from '$shared/DataVerse/Ticker'
import constant from '$shared/DataVerse/derivations/constant'
import dictAtom from '$shared/DataVerse/deprecated/atoms/dictAtom'
import boxAtom from '$shared/DataVerse/deprecated/atoms/boxAtom'

describe('autoDerive', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  it('should work', () => {
    const o = dictAtom({
      foo: boxAtom('foo'),
    })
    const fooPointer = o.pointer().prop('foo')
    const d = new AutoDerivation(() => {
      return fooPointer.getValue() + 'boo'
    })
    expect(d.getValue()).toEqual('fooboo')

    const changes: Array<typeof d.ChangeType> = []
    d.changes(ticker).tap(c => {
      changes.push(c)
    })

    o.prop('foo').set('foo2')
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
