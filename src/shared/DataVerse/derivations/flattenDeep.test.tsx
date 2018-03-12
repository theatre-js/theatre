import flattenDeep from './flattenDeep'
import Ticker from '$src/shared/DataVerse/Ticker'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import withDeps from '$src/shared/DataVerse/derivations/withDeps'
import constant from '$src/shared/DataVerse/derivations/constant'

describe('FlattenDeepDerivation', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })
  it('simple case', () => {
    const a = boxAtom(1)
    const aD = a.derivation()
    const b = boxAtom(3)
    const bD = b.derivation()
    const f = aD.flatMap(aValue => bD.map(bValue => aValue + bValue))
    expect(f.getValue()).toEqual(4)
    a.set(2)
    expect(f.getValue()).toEqual(5)

    const changes: $IntentionalAny[] = []

    f.changes(ticker).tap(c => {
      changes.push(c)
    })

    ticker.tick()
    expect(changes).toHaveLength(0)
    a.set(3)
    expect(changes).toHaveLength(0)
    ticker.tick()
    expect(changes).toMatchObject([6])
    b.set(4)
    ticker.tick()
    expect(changes).toMatchObject([6, 7])
  })

  it('events should work', () => {
    const a = boxAtom(1)
    const b = boxAtom(3)
    const aD = a.derivation()
    const bD = b.derivation()
    const final = aD.map(n => bD.map(m => m + n)).flattenDeep(7)

    expect(final.getValue()).toEqual(4)
    a.set(2)
    expect(final.getValue()).toEqual(5)

    b.set(4)
    expect(final.getValue()).toEqual(6)

    const adEvents: $IntentionalAny[] = []

    aD.changes(ticker).tap(newVal => {
      adEvents.push(newVal)
    })

    expect(adEvents).toHaveLength(0)
    a.set(3)
    expect(adEvents).toHaveLength(0)

    ticker.tick()
    expect(adEvents).toMatchObject([3])

    const finalEvents: $IntentionalAny[] = []
    final.changes(ticker).tap(v => {
      finalEvents.push(v)
    })
    a.set(4)

    expect(finalEvents).toHaveLength(0)
    ticker.tick()
    expect(finalEvents).toMatchObject([8])
    expect(adEvents).toMatchObject([3, 4])

    b.set(5)
    expect(finalEvents).toHaveLength(1)
    ticker.tick()
    expect(adEvents).toHaveLength(2)
    expect(finalEvents).toHaveLength(2)
    expect(finalEvents).toMatchObject([8, 9])
  })

  it('more', () => {
    const a = boxAtom('a')
    const aD = a.derivation()
    const b = boxAtom('b')
    const bD = b.derivation()
    const cD = aD
      .map(aValue => bD.map(bValue => withDeps({}, () => aValue + bValue)))
      .flattenDeep(7)

    expect(cD.getValue()).toEqual('ab')
    const changes: $IntentionalAny[] = []
    cD.changes(ticker).tap(c => {
      changes.push(c)
    })

    b.set('bb')
    ticker.tick()
    expect(changes).toMatchObject(['abb'])
  })

  it('depth', () => {
    const a = boxAtom(1)
    const b = boxAtom(3)
    const aD = a.derivation()
    const bD = b.derivation()
    expect(
      aD
        .map(() => bD)
        .flattenDeep(0)
        .getValue(),
    ).toEqual(bD)
    expect(
      aD
        .map(() => bD)
        .flattenDeep(1)
        .getValue(),
    ).toEqual(3)
  })
  it('blah', () => {
    const a = boxAtom('a')
    const aD = a.derivation()

    const b = constant(constant(aD))
    b
      .getValue()
      .getValue()
      .getValue() as string

    // c
    //   .getValue()
    //   .getValue()
    //   .getValue() as number

    // const f = flattenDeep(c, 3)
    const f = b.flattenDeep(3)

    expect(f.getValue()).toEqual('a')
    a.set('a2')
    expect(f.getValue()).toEqual('a2')

    const changes: $IntentionalAny[] = []
    f.changes(ticker).tap(c => {
      changes.push(c)
    })

    a.set('a32')
    a.set('a3')
    ticker.tick()
    expect(changes).toMatchObject(['a3'])
  })
  ;(function() {
    const num = constant(1)
    const ofNum = constant(num)
    const ofNumOfNum = constant(ofNum)
    const ofNumOfNumofNum = constant(ofNumOfNum)
    const ofNumOfNumofNumOfNum = constant(ofNumOfNumofNum)
    ofNum.getValue().getValue() as number
    // $FlowExpectError
    // ofNum.getValue().getValue() as string

    // Depth 1
    ;(function() {
      flattenDeep(ofNumOfNum, 1)
        .getValue()
        .getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNum, 1)
        .getValue()
        .getValue() as string
      flattenDeep(ofNum, 1).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNum, 1).getValue() as string
      flattenDeep(num, 1).getValue() as number
      // $FlowExpectError
      flattenDeep(num, 1).getValue() as string
      ofNumOfNum
        .flattenDeep(1)
        .getValue()
        .getValue() as number
      // @todo flow should catch this, but can't atm
      ofNumOfNum
        .flattenDeep(1)
        .getValue()
        .getValue() as string
      ofNum.flattenDeep(1).getValue() as number
      // flow should catch this, but can't atm
      ofNum.flattenDeep(1).getValue() as string
      num.flattenDeep(1).getValue() as number
      // flow should catch this, but can't atm
      num.flattenDeep(1).getValue() as string
    })

    // Depth 2
    ;(function() {
      flattenDeep(ofNumOfNum, 2).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNum, 2).getValue() as string
      flattenDeep(ofNum, 2).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNum, 2).getValue() as string
      flattenDeep(num, 2).getValue() as number
      // $FlowExpectError
      flattenDeep(num, 2).getValue() as string
    })

    // Depth 3
    ;(function() {
      flattenDeep(ofNumOfNumofNum, 3).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNumofNum, 3).getValue() as string
      flattenDeep(ofNumOfNum, 3).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNum, 3).getValue() as string
      flattenDeep(ofNum, 3).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNum, 3).getValue() as string
      flattenDeep(num, 3).getValue() as number
      // $FlowExpectError
      flattenDeep(num, 3).getValue() as string

      // $FlowExpectError
      // ofNumOfNum.plattenDeep(3).getValue() as string
    })

    // Depth 4
    ;(function() {
      flattenDeep(ofNumOfNumofNumOfNum, 4).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNumofNumOfNum, 4).getValue() as string
      flattenDeep(ofNumOfNumofNum, 4).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNumofNum, 4).getValue() as string
      flattenDeep(ofNumOfNum, 4).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNum, 4).getValue() as string
      flattenDeep(ofNum, 4).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNum, 4).getValue() as string
      flattenDeep(num, 4).getValue() as number
      // $FlowExpectError
      flattenDeep(num, 4).getValue() as string
    })

    // No depth given
    ;(function() {
      flattenDeep(ofNumOfNumofNumOfNum).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNumofNumOfNum).getValue() as string
      flattenDeep(ofNumOfNumofNum).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNumofNum).getValue() as string
      flattenDeep(ofNumOfNum).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNumOfNum).getValue() as string
      flattenDeep(ofNum).getValue() as number
      // $FlowExpectError
      flattenDeep(ofNum).getValue() as string
      flattenDeep(num).getValue() as number
      // $FlowExpectError
      flattenDeep(num).getValue() as string
    })
  })
})
// ;(function() {
//   interface IBox<V> {
//     unbox(): V
//     flattenDeep: () => $Call<FlattenDeep, IBox<V>>
//     set: (v: V) => void
//   }

//   class Box<V> implements IBox<V> {
//     _value: V
//     flattenDeep: any
//     set: any

//     constructor(value: V) {
//       this._value = value
//       return this
//     }

//     unbox(): V {
//       return this._value
//     }
//   }

//   const box = new Box(new Box(new Box(10)))

//   type FlattenDeep = (<
//     Ret,
//     V5 extends IBox<Ret>,
//     V4 extends IBox<V5>,
//     V3 extends IBox<V4>,
//     V2 extends IBox<V3>,
//     V1 extends IBox<V2>
//   >(
//     outer: V1,
//   ) => IBox<Ret>) &
//     (<
//       Ret,
//       V4 extends IBox<Ret>,
//       V3 extends IBox<V4>,
//       V2 extends IBox<V3>,
//       V1 extends IBox<V2>
//     >(
//       outer: V1,
//     ) => IBox<Ret>) &
//     (<Ret, V3 extends IBox<Ret>, V2 extends IBox<V3>, V1 extends IBox<V2>>(
//       outer: V1,
//     ) => IBox<Ret>) &
//     (<Ret, V2 extends IBox<Ret>, V1 extends IBox<V2>>(outer: V1) => IBox<Ret>) &
//     (<Ret, V1 extends IBox<Ret>>(outer: V1) => IBox<Ret>)

//   declare var flattenDeep: FlattenDeep
//   flattenDeep(box).unbox() as number
//   // $FlowExpectError
//   flattenDeep(box).unbox() as string
//   box.flattenDeep().unbox() as number
//   // $FlowExpectError
//   box.flattenDeep().unbox() as string

//   box
//     .unbox()
//     .unbox()
//     .set(10)
//   // box.unbox().unbox().set('hi')
// })
