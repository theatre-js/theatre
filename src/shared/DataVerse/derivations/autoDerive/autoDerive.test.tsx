import autoDerive, {AutoDerivation} from './autoDerive'
import Ticker from '$src/shared/DataVerse/Ticker'
import constant from '$src/shared/DataVerse/derivations/constant'
import dictAtom from '$src/shared/DataVerse/atoms/dict'
import boxAtom from '$src/shared/DataVerse/atoms/box'

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
  it.skip('should only collect immediate dependencies', () => {
    const aD = constant(1)
    const bD = aD.map(v => v * 2)
    const cD = autoDerive(() => {
      return bD.getValue()
    })
    expect(cD.getValue()).toEqual(2)
    expect(cD._dependencies.size).toEqual(1)
  })
  ;(function() {
    const a = autoDerive(() => {
      return 'hi'
    })

    a.getValue()
    a.getValue() as string
    // $FlowExpectError
    // ;(a.getValue() as number)

    const changes: Array<string> = []
    // const wrongChanges: Array<number> = []

    a.changes(null as $IntentionalAny).tap(c => {
      changes.push(c)
      // $FlowExpectError
      // wrongChanges.push(c)
    })
  })
})
