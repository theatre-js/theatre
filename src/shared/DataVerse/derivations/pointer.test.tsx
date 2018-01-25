// @flow
import type {IPointerToBoxAtom} from './pointer'
import * as D from '$shared/DataVerse'
import {DictAtom} from '$shared/DataVerse/atoms/dict'

describe('pointer', () => {
  let ticker
  beforeEach(() => {
    ticker = new D.Ticker()
  })
  it('should work', () => {
    type Root = D.IDictAtom<{
      a: D.IDictAtom<{
        aa: D.IBoxAtom<string>,
        bb: D.IBoxAtom<string>,
      }>,
    }>
    const root: Root = D.atoms.dict({
      a: D.atoms.dict({
        aa: D.atoms.box('aa'),
        bb: D.atoms.box('bb'),
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
    root.prop('a').setProp('aa', D.atoms.dict({}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    // $FlowIgnore
    root.prop('a').setProp('aa', D.atoms.dict({aa: D.atoms.box('aa3')}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', D.atoms.box('aa3'))
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work', () => {
    const root = D.atoms.dict({
      a: D.atoms.dict({
        aa: D.atoms.box('aa'),
        bb: D.atoms.box('bb'),
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
    root.prop('a').setProp('aa', D.atoms.dict({}))
    ticker.tick()
    expect(aaD.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', D.atoms.dict({aa: D.atoms.box('aa3')}))
    ticker.tick()
    expect(aaD.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', D.atoms.box('aa3'))
    ticker.tick()
    expect(aaD.getValue()).toEqual('aa3')
  })

  it('should work with derived stuff too', () => {
    const ticker = new D.Ticker()
    const foo = D.atoms.box('foo')
    const atom = D.atoms.dict({
      a: D.atoms.dict({
        foo,
      }),
    })

    const o = D.derivations.prototypalDict({
      a() {
        return atom
      },
      b() {
        return 'hi'
      },
    })
    const f = o.face(ticker)
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
    type RootType = D.IDictAtom<{
      str: D.IBoxAtom<string>,
      obj: D.IDictAtom<{
        objStr: D.IBoxAtom<string>,
        objObj: D.IDictAtom<{
          objObjStr: D.IBoxAtom<string>,
        }>,
      }>,
    }>
    const root: RootType = D.atoms.dict({
      str: D.atoms.box('str'),
      obj: D.atoms.dict({
        objStr: D.atoms.box('str'),
        objObj: D.atoms.dict({
          objObjStr: D.atoms.box('str'),
        }),
      }),
    })
    ;(root.prop('str').getValue(): string)
    // $FlowExpectError
    ;(root.prop('str').getValue(): number)
    ;(root.pointer().getValue(): RootType)
    ;(root
      .pointer()
      .prop('str')
      .getValue(): string)
    // $FlowExpectError
    ;(root
      .pointer()
      .prop('str')
      .getValue(): number)
    ;(root
      .pointer()
      .prop('obj')
      .getValue(): D.IDictAtom<{
      objStr: D.IBoxAtom<string>,
      objObj: D.IDictAtom<{objObjStr: D.IBoxAtom<string>}>,
    }>)
    // $FlowExpectError
    ;(root
      .pointer()
      .prop('obj')
      .getValue(): D.IDictAtom<{objStr: D.IBoxAtom<number>}>)
    ;(root
      .pointer()
      .prop('obj')
      .prop('objStr')
      .getValue(): string)
    // $FlowExpectError
    ;(root
      .pointer()
      .prop('obj')
      .prop('objStr')
      .getValue(): number)
    ;(root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .getValue(): D.IDictAtom<{objObjStr: D.IBoxAtom<string>}>)
    // $FlowExpectError
    ;(root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .getValue(): D.IDictAtom<{objObjStr: D.IBoxAtom<number>}>)
    ;(root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .prop('objObjStr')
      .getValue(): string)
    // $FlowExpectError
    ;(root
      .pointer()
      .prop('obj')
      .prop('objObj')
      .prop('objObjStr')
      .getValue(): number)
  })
  ;(function() {
    type RootType = D.IDictAtom<{
      str: D.IBoxAtom<string>,
      obj: D.IDictAtom<{
        objStr: D.IBoxAtom<string>,
      }>,
    }>

    const root: RootType = D.atoms.dict({
      str: D.atoms.box('str'),
      obj: D.atoms.dict({
        objStr: D.atoms.box('str'),
      }),
    })

    const pointerToRootStr = root.pointer().prop('str')
    // const pointerToRootObj = root.pointer().prop('obj');
    ;(pointerToRootStr: IPointerToBoxAtom<string>)

    type DictOfPointers = D.IDictAtom<{
      unboxedStr: IPointerToBoxAtom<string>,
      // boxedStr: D.IBoxAtom<D.IPointerToBoxAtom<string>>,
    }>

    const dictOfPointers: DictOfPointers = D.atoms.dict({
      unboxedStr: pointerToRootStr,
      // boxedStr: D.atoms.box(pointerToRootStr),
    })
    ;(dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue(): string)
    // $FlowExpectError
    ;(dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue(): number)

    // (dictOfPointers.pointer().prop('boxedStr').getValue(): string);
    // (dictOfPointers.pointer().prop('boxedStr').getValue(): number);
  })
  ;(function() {
    type RootType = D.IDictAtom<{
      str: D.IBoxAtom<string>,
      obj: D.IDictAtom<{
        objStr: D.IBoxAtom<string>,
      }>,
    }>

    const root: RootType = D.atoms.dict({
      str: D.atoms.box('str'),
      obj: D.atoms.dict({
        objStr: D.atoms.box('str'),
      }),
    })

    const pointerToRootStr = root.pointer().prop('str')

    const dictOfPointers = D.atoms.dict({
      unboxedStr: (pointerToRootStr: IPointerToBoxAtom<string>),
      // boxedStr: D.atoms.box(pointerToRootStr),
    })
    ;(dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue(): string)
    // $FlowExpectError
    ;(dictOfPointers
      .pointer()
      .prop('unboxedStr')
      .getValue(): number)

    // (dictOfPointers.pointer().prop('boxedStr').getValue(): string);
    // (dictOfPointers.pointer().prop('boxedStr').getValue(): number);
  })
})
