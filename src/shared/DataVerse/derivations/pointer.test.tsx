import dictAtom, {DictAtom} from '$shared/DataVerse/atoms/dict'
import derivedClass from '$src/shared/DataVerse/derivedClass/derivedClass'
import boxAtom, {BoxAtom} from '$src/shared/DataVerse/atoms/box'
import Ticker from '$src/shared/DataVerse/Ticker'

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
    // $FlowIgnore
    root.prop('a').setProp('aa', dictAtom({}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    // $FlowIgnore
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

    const changes = []
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
    root.prop('a').setProp('aa', dictAtom({}))
    ticker.tick()
    expect(aaD.getValue()).toBeInstanceOf(DictAtom)
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
  ;(function() {
    type RootType = DictAtom<{
      str: BoxAtom<string>
      obj: DictAtom<{
        objStr: BoxAtom<string>
        objObj: DictAtom<{
          objObjStr: BoxAtom<string>
        }>
      }>
    }>
    const root: RootType = dictAtom({
      str: boxAtom('str'),
      obj: dictAtom({
        objStr: boxAtom('str'),
        objObj: dictAtom({
          objObjStr: boxAtom('str'),
        }),
      }),
    })
    root.prop('str').getValue() as string
    // $FlowExpectError
    root.prop('str').getValue() as number
    root.pointer().getValue() as RootType
    root
      .pointer()
      .prop('str')
      .getValue() as string
    // $FlowExpectError
    root
      .pointer()
      .prop('str')
      .getValue() as number
    root
      .pointer()
      .prop('obj')
      .getValue() as DictAtom<{
      objStr: BoxAtom<string>
      objObj: DictAtom<{objObjStr: BoxAtom<string>}>
    }>
    // $FlowExpectError
    root
      .pointer()
      .prop('obj')
      .getValue() as DictAtom<{objStr: BoxAtom<number>}>
    root
      .pointer()
      .prop('obj')
      .prop('objStr')
      .getValue() as string
    // $FlowExpectError
    root
      .pointer()
      .prop('obj')
      .prop('objStr')
      .getValue() as number
    root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .getValue() as DictAtom<{objObjStr: BoxAtom<string>}>
    // $FlowExpectError
    root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .getValue() as DictAtom<{objObjStr: BoxAtom<number>}>
    root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .prop('objObjStr')
      .getValue() as string
    // $FlowExpectError
    root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .prop('objObjStr')
      .getValue() as number
  })
  ;(function() {
    type RootType = DictAtom<{
      str: BoxAtom<string>
      obj: DictAtom<{
        objStr: BoxAtom<string>
      }>
    }>

    const root: RootType = dictAtom({
      str: boxAtom('str'),
      obj: dictAtom({
        objStr: boxAtom('str'),
      }),
    })

    const pointerToRootStr = root.pointer().prop('str')
    // const pointerToRootObj = root.pointer().prop('obj');
    pointerToRootStr as IPointerToBoxAtom<string>

    type DictOfPointers = DictAtom<{
      unboxedStr: IPointerToBoxAtom<string>
      // boxedStr: BoxAtom<D.IPointerToBoxAtom<string>>,
    }>

    const dictOfPointers: DictOfPointers = dictAtom({
      unboxedStr: pointerToRootStr,
      // boxedStr: box(pointerToRootStr),
    })
    dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue() as string
    // $FlowExpectError
    dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue() as number

    // (dictOfPointers.pointer().prop('boxedStr').getValue(): string);
    // (dictOfPointers.pointer().prop('boxedStr').getValue(): number);
  })
  ;(function() {
    type RootType = DictAtom<{
      str: BoxAtom<string>
      obj: DictAtom<{
        objStr: BoxAtom<string>
      }>
    }>

    const root: RootType = dictAtom({
      str: boxAtom('str'),
      obj: dictAtom({
        objStr: boxAtom('str'),
      }),
    })

    const pointerToRootStr = root.pointer().prop('str')

    const dictOfPointers = dictAtom({
      unboxedStr: pointerToRootStr as IPointerToBoxAtom<string>,
      // boxedStr: box(pointerToRootStr),
    })
    dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue() as string
    // $FlowExpectError
    dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue() as number

    // (dictOfPointers.pointer().prop('boxedStr').getValue(): string);
    // (dictOfPointers.pointer().prop('boxedStr').getValue(): number);
  })
})
