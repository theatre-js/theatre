import dictAtom, {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import derivedClass from '$shared/DataVerse/derivedClass/derivedClass'
import boxAtom, {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import Ticker from '$shared/DataVerse/Ticker'

describe('pointer', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })
  it('should work', () => {
    type Root = DictAtom<{
      a: DictAtom<{
        aa: BoxAtom<string>
        bb: BoxAtom<string>
      }>
    }>
    const root: Root = dictAtom({
      a: dictAtom({
        aa: boxAtom('aa'),
        bb: boxAtom('bb'),
      }),
    })
    // debugger
    const aaP = root
      .pointer()
      .prop('a')
      .prop('aa')
    expect(aaP.getValue()).toEqual('aa')
    root
      .prop('a')
      .prop('aa')
      .set('aa2')
    expect(aaP.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    expect(aaP.getValue()).toEqual(undefined)
    // @ts-ignore
    root.prop('a').setProp('aa', dictAtom({}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    // @ts-ignore
    root.prop('a').setProp('aa', dictAtom({aa: boxAtom('aa3')}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', boxAtom('aa3'))
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work', () => {
    const root = dictAtom({
      a: dictAtom({
        aa: boxAtom('aa'),
        bb: boxAtom('bb'),
      }),
    })
    const aaP = root
      .pointer()
      .prop('a')
      .prop('aa')
    const aaD = aaP

    const changes: string[] = []
    aaD.changes(ticker).tap(c => {
      changes.push(c)
    })
    expect(aaD.getValue()).toEqual('aa')
    root
      .prop('a')
      .prop('aa')
      .set('aa2')
    ticker.tick()
    expect(aaD.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    ticker.tick()
    expect(aaD.getValue()).toEqual(undefined)
    // @ts-ignore
    root.prop('a').setProp('aa', dictAtom({}))
    ticker.tick()
    expect(aaD.getValue()).toBeInstanceOf(DictAtom)
    // @ts-ignore
    root.prop('a').setProp('aa', dictAtom({aa: boxAtom('aa3')}))
    ticker.tick()
    expect(aaD.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', boxAtom('aa3'))
    ticker.tick()
    expect(aaD.getValue()).toEqual('aa3')
  })

  it('should work with derived stuff too', () => {
    const ticker = new Ticker()
    const foo = boxAtom('foo')
    const atom = dictAtom({
      a: dictAtom({
        foo,
      }),
    })

    const o = derivedClass({
      a() {
        return atom
      },
      b() {
        return 'hi'
      },
    })
    const f = o.instance(ticker)
    expect(
      f
        .pointer()
        .prop('b')
        .getValue(),
    ).toEqual('hi')
    expect(
      f
        .pointer()
        .prop('a')
        .prop('a')
        .prop('foo')
        .getValue(),
    ).toEqual('foo')

    const changes = []
    f
      .pointer()
      .prop('a')
      .prop('a')
      .prop('foo')
      .changes(ticker)
      .tap(c => {
        changes.push(c)
      })

    foo.set('foo2')
    ticker.tick()
    expect(changes).toMatchObject(['foo2'])
  })
})
