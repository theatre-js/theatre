import dictAtom, {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import boxAtom from '$shared/DataVerse/atoms/boxAtom'
import Ticker from '$shared/DataVerse/Ticker'

describe('extend()', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })
  it('should work', () => {
    const o1 = dictAtom({
      a: boxAtom('a'),
    })

    const o2: DictAtom<{
      b: BoxAtom<string>
      a: BoxAtom<undefined | null | string>
      c?: BoxAtom<string>
    }> = dictAtom({
      b: boxAtom('b'),
      a: boxAtom(undefined),
    })

    const x = o1.derivedDict().extend(o2.derivedDict())

    expect(x.prop('a').getValue()).toEqual('a')
    expect(x.prop('b').getValue()).toEqual('b')

    const aP = x.prop('a')

    o1.prop('a').set('aa')
    expect(aP.getValue()).toEqual('aa')
    o2.setProp('a', boxAtom('a2'))
    expect(aP.getValue()).toEqual('a2')

    const aPChanges: Array<string> = []
    aP.changes(ticker).tap(c => {
      aPChanges.push(c)
    })

    o2.prop('a').set('aa2')
    ticker.tick()
    expect(aPChanges).toMatchObject(['aa2'])
    o1.prop('a').set('aaa')
    ticker.tick()
    expect(aPChanges).toHaveLength(1)

    expect(x.keys()).toHaveLength(2)
    expect(x.keys()).toContain('a')
    expect(x.keys()).toContain('b')

    const cChanges: $FixMe[] = []
    // debugger
    x.changes().tap(c => {
      cChanges.push(c)
    })

    o2.setProp('c', boxAtom('c'))
    expect(x.keys()).toHaveLength(3)
    expect(x.keys()).toContain('a')
    expect(x.keys()).toContain('b')
    expect(x.keys()).toContain('c')

    expect(cChanges[0]).toMatchObject({addedKeys: ['c'], deletedKeys: []})
    o2.deleteProp('c')
    expect(cChanges[1]).toMatchObject({addedKeys: [], deletedKeys: ['c']})
    o2.deleteProp('a')
    expect(cChanges).toHaveLength(2)
    o1.deleteProp('a')
    expect(cChanges[2]).toMatchObject({addedKeys: [], deletedKeys: ['a']})
    // @ts-ignore @expected
    o1.setProp('b', boxAtom('bb'))
    expect(cChanges).toHaveLength(3)
  })
})
