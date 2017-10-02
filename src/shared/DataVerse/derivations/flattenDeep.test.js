// @flow
import * as D from '$shared/DataVerse'
import flattenDeep from './flattenDeep'

describe('FlattenDeepDerivation', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })
  it('simple case', () => {
    const a = new D.BoxAtom(1)
    const aD = a.derivation()
    const b = new D.BoxAtom(3)
    const bD = b.derivation()
    const f = aD.flatMap((aValue) => bD.map((bValue) => aValue + bValue))
    expect(f.getValue()).toEqual(4)
    a.set(2)
    expect(f.getValue()).toEqual(5)

    const changes = []

    f.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    context.tick()
    expect(changes).toHaveLength(0)
    a.set(3)
    expect(changes).toHaveLength(0)
    context.tick()
    expect(changes).toMatchObject([6])
    b.set(4)
    context.tick()
    expect(changes).toMatchObject([6, 7])
  })

  it('events should work', () => {
    const a = new D.BoxAtom(1)
    const b = new D.BoxAtom(3)
    const aD = D.deriveFromBoxAtom(a)
    const bD = D.deriveFromBoxAtom(b)
    const final = aD.map((n) => bD.map((m) => m + n)).flattenDeep(7)

    expect(final.getValue()).toEqual(4)
    a.set(2)
    expect(final.getValue()).toEqual(5)

    b.set(4)
    expect(final.getValue()).toEqual(6)

    expect(() => aD.changes()).toThrow()
    const context = new D.Context()

    const adEvents = []
    aD.setDataVerseContext(context)

    aD.changes().tap((newVal) => {
      adEvents.push(newVal)
    })

    expect(adEvents).toHaveLength(0)
    a.set(3)
    expect(adEvents).toHaveLength(0)

    context.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents = []
    final.setDataVerseContext(context)
    final.changes().tap((v) => {finalEvents.push(v)})
    a.set(4)

    expect(finalEvents).toHaveLength(0)
    context.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    b.set(5)
    expect(finalEvents).toHaveLength(1)
    context.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])
  })

  it('more', () => {
    const context = new D.Context()
    const a = new D.BoxAtom('a')
    const aD = a.derivation()
    const b = new D.BoxAtom('b')
    const bD = b.derivation()
    const cD = aD.map((aValue) => bD.map((bValue) => D.withDeps({}, () => aValue + bValue))).flattenDeep(7)

    expect(cD.getValue()).toEqual('ab')
    cD.setDataVerseContext(context)
    const changes = []
    cD.changes().tap((c) => {changes.push(c)})

    b.set('bb')
    context.tick()
    expect(changes).toMatchObject(['abb'])
  })

  it('depth', () => {
    const a = new D.BoxAtom(1)
    const b = new D.BoxAtom(3)
    const aD = D.deriveFromBoxAtom(a)
    const bD = D.deriveFromBoxAtom(b)
    expect(aD.map(() => bD).flattenDeep(0).getValue()).toEqual(bD)
    expect(aD.map(() => bD).flattenDeep(1).getValue()).toEqual(3)
  })
  it('blah', () => {
    const a = new D.BoxAtom('a')
    const aD = a.derivation()

    const c = D.constant(D.constant(aD));
    (c.getValue().getValue().getValue(): string);
    // $FlowExpectError
    (c.getValue().getValue().getValue(): number);

    // const f = flattenDeep(c, 3)
    const f = c.flattenDeep(3)

    expect(f.getValue()).toEqual('a')
    a.set('a2')
    expect(f.getValue()).toEqual('a2')

    const changes = []
    f.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    a.set('a32')
    a.set('a3')
    context.tick()
    expect(changes).toMatchObject(['a3'])
  });

  (function(){
    const num = D.constant(1)
    const ofNum = D.constant(num)
    const ofNumOfNum = D.constant(ofNum)
    const ofNumOfNumofNum = D.constant(ofNumOfNum)
    const ofNumOfNumofNumOfNum = D.constant(ofNumOfNumofNum);

    (ofNum.getValue().getValue(): number);
    // $FlowExpectError
    (ofNum.getValue().getValue(): string);

    // Depth 1
    (function(){
      (flattenDeep(ofNumOfNum, 1).getValue().getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNum, 1).getValue().getValue(): string);

      (flattenDeep(ofNum, 1).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNum, 1).getValue(): string);

      (flattenDeep(num, 1).getValue(): number);
      // $FlowExpectError
      (flattenDeep(num, 1).getValue(): string);

      (ofNumOfNum.flattenDeep(1).getValue().getValue(): number);
      // @todo flow should catch this, but can't atm
      (ofNumOfNum.flattenDeep(1).getValue().getValue(): string);

      (ofNum.flattenDeep(1).getValue(): number);
      // @flow flow should catch this, but can't atm
      (ofNum.flattenDeep(1).getValue(): string);

      (num.flattenDeep(1).getValue(): number);
      // @flow flow should catch this, but can't atm
      (num.flattenDeep(1).getValue(): string)
    });

    // Depth 2
    (function(){
      (flattenDeep(ofNumOfNum, 2).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNum, 2).getValue(): string);

      (flattenDeep(ofNum, 2).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNum, 2).getValue(): string);

      (flattenDeep(num, 2).getValue(): number);
      // $FlowExpectError
      (flattenDeep(num, 2).getValue(): string)
    });

    // Depth 3
    (function(){
      (flattenDeep(ofNumOfNumofNum, 3).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNumofNum, 3).getValue(): string);

      (flattenDeep(ofNumOfNum, 3).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNum, 3).getValue(): string);

      (flattenDeep(ofNum, 3).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNum, 3).getValue(): string);

      (flattenDeep(num, 3).getValue(): number);
      // $FlowExpectError
      (flattenDeep(num, 3).getValue(): string);

      // $FlowExpectError
      (ofNumOfNum.plattenDeep(3).getValue(): string)
    });

    // Depth 4
    (function(){
      (flattenDeep(ofNumOfNumofNumOfNum, 4).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNumofNumOfNum, 4).getValue(): string);

      (flattenDeep(ofNumOfNumofNum, 4).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNumofNum, 4).getValue(): string);

      (flattenDeep(ofNumOfNum, 4).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNum, 4).getValue(): string);

      (flattenDeep(ofNum, 4).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNum, 4).getValue(): string);

      (flattenDeep(num, 4).getValue(): number);
      // $FlowExpectError
      (flattenDeep(num, 4).getValue(): string)
    });

    // No depth given
    (function(){
      (flattenDeep(ofNumOfNumofNumOfNum).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNumofNumOfNum).getValue(): string);

      (flattenDeep(ofNumOfNumofNum).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNumofNum).getValue(): string);

      (flattenDeep(ofNumOfNum).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNumOfNum).getValue(): string);

      (flattenDeep(ofNum).getValue(): number);
      // $FlowExpectError
      (flattenDeep(ofNum).getValue(): string);

      (flattenDeep(num).getValue(): number);
      // $FlowExpectError
      (flattenDeep(num).getValue(): string)
    })

  })
});

(function(){
  interface IBox<V> {
    unbox(): V,
    flattenDeep: () => $Call<FlattenDeep, IBox<V>>,
    set: (V) => void,
  }

  class Box<V> implements IBox<V> {
    _value: V
    flattenDeep: any
    set: any

    constructor(value: V): IBox<V> {
      this._value = value
      return this
    }

    unbox(): V {
      return this._value
    }

  }

  const box = new Box(new Box(new Box(10)))

  type FlattenDeep =
    (<Ret, V5: IBox<Ret>, V4: IBox<V5>, V3: IBox<V4>, V2: IBox<V3>, V1: IBox<V2>>(outer: V1) => IBox<Ret>) &
    (<Ret, V4: IBox<Ret>, V3: IBox<V4>, V2: IBox<V3>, V1: IBox<V2>>(outer: V1) => IBox<Ret>) &
    (<Ret, V3: IBox<Ret>, V2: IBox<V3>, V1: IBox<V2>>(outer: V1) => IBox<Ret>) &
    (<Ret, V2: IBox<Ret>, V1: IBox<V2>>(outer: V1) => IBox<Ret>) &
    (<Ret, V1: IBox<Ret>>(outer: V1) => IBox<Ret>)

    declare var flattenDeep: FlattenDeep;

    (flattenDeep(box).unbox(): number);
    // $FlowExpectError
    (flattenDeep(box).unbox(): string);

    (box.flattenDeep().unbox(): number);
    // $FlowExpectError
    (box.flattenDeep().unbox(): string);

    box.unbox().unbox().set(10)
    // box.unbox().unbox().set('hi')

});