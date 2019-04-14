import * as t from '$shared/ioTypes'
import {Right} from 'fp-ts/lib/Either'
import {expectType} from '$shared/types'

type RecT1 = {
  type: 'a'
  items: Array<RecT1>
}

const Rec1 = t.recursion<RecT1>('T', Self =>
  t.interface({
    type: t.literal('a'),
    items: t.array(Self),
  }),
)
const Rec2 = t.recursion<string>('T', Self =>
  // $ExpectError
  t.interface({
    type: t.literal('a'),
    items: t.array(Self),
  }),
)

//
// literal
//

const L1 = t.literal('a')
// $ExpectError
const x1: t.StaticTypeOf<typeof L1> = 's'
const x2: t.StaticTypeOf<typeof L1> = 'a'

//
// keyof
//

const K1 = t.keyof({a: true, b: true})
// $ExpectError
const x3: t.StaticTypeOf<typeof K1> = 's'
const x4: t.StaticTypeOf<typeof K1> = 'a'
const x5: t.StaticTypeOf<typeof K1> = 'b'

//
// default types
//

// $ExpectError
undefined as t.StaticTypeOf<typeof t.null>
null as t.StaticTypeOf<typeof t.null>

// $ExpectError
null as t.StaticTypeOf<typeof t.undefined>
undefined as t.StaticTypeOf<typeof t.undefined>

// $ExpectError
1 as t.StaticTypeOf<typeof t.string>
's' as t.StaticTypeOf<typeof t.string>

//
// refinement
//

const R1 = t.refinement(t.number, n => n % 2 === 0)
// $ExpectError
's' as t.StaticTypeOf<typeof R1>
2 as t.StaticTypeOf<typeof R1>

//
// array
//

const A1 = t.array(t.number)
// $ExpectError
's' as t.StaticTypeOf<typeof A1>
// $ExpectError
['s'] as t.StaticTypeOf<typeof A1>
[1] as t.StaticTypeOf<typeof A1>

//
// interface
//

const I1 = t.interface({name: t.string, age: t.number})
// $ExpectError
const x6: t.StaticTypeOf<typeof I1> = {}
// $ExpectError
const x7: t.StaticTypeOf<typeof I1> = {name: 'name'}
// $ExpectError
const x8: t.StaticTypeOf<typeof I1> = {age: 43}
const x9: t.StaticTypeOf<typeof I1> = {name: 'name', age: 43}

const I2 = t.interface({
  name: t.string,
  father: t.interface({surname: t.string}),
})
type I2T = t.StaticTypeOf<typeof I2>
// $ExpectError
const x10: I2T = {name: 'name', father: {}}
const x11: I2T = {name: 'name', father: {surname: 'surname'}}

//
// dictionary
//

const D1 = t.record(t.keyof({a: true}), t.number)
// $ExpectError
const x12: t.StaticTypeOf<typeof D1> = {a: 's'}
// $ExpectError
const x12_2: t.StaticTypeOf<typeof D1> = {c: 1}
const x13: t.StaticTypeOf<typeof D1> = {a: 1}

//
// union
//

const U1 = t.union([t.string, t.number])
// $ExpectError
const x14: t.StaticTypeOf<typeof U1> = true
const x15: t.StaticTypeOf<typeof U1> = 's'
const x16: t.StaticTypeOf<typeof U1> = 1

//
// intersection
//

const IN1 = t.intersection([
  t.interface({a: t.number}),
  t.interface({b: t.string}),
])
// $ExpectError
const x17: t.StaticTypeOf<typeof IN1> = {a: 1}
const x18: t.StaticTypeOf<typeof IN1> = {a: 1, b: 's'}

//
// tuple
//

const T1 = t.tuple([t.string, t.number])
// $ExpectError
const x19: t.StaticTypeOf<typeof T1> = ['s', true]
const x20: t.StaticTypeOf<typeof T1> = ['s', 1]

//
// partial
//

const P1 = t.partial({name: t.string})
type P1T = t.StaticTypeOf<typeof P1>
// $ExpectError
const x21: P1T = {name: 1}
const x22: P1T = {}
const x23: P1T = {name: 's'}

//
// readonly
//

const RO1 = t.readonly(t.interface({name: t.string}))
const x24: t.StaticTypeOf<typeof RO1> = {name: 's'}
// $ExpectError
x24.name = 's2'
// $ExpectError
const x25: t.StaticTypeOf<typeof RO1> = {name: 1}

//
// readonlyArray
//

const ROA1 = t.readonlyArray(t.number)
// $ExpectError
const x26: t.StaticTypeOf<typeof ROA1> = ['s']
const x27: t.StaticTypeOf<typeof ROA1> = [1]
// $ExpectError
x27[0] = 2
// $ExpectError
x27.push(2)

//
// strict
//

const S1 = t.strict({name: t.string})
type TS1 = t.StaticTypeOf<typeof S1>
const x32: TS1 = {name: 'Giulio'}
const x33input = {name: 'foo', foo: 'foo'}
const x33: TS1 = x33input
// $ExpectError
const S2 = t.strict(t.string)

//
// object
//
const O1 = t.object
type TO1 = t.StaticTypeOf<typeof O1>
const x34: TO1 = {name: 'Giulio'}
// $ExpectError
const x35: TO1 = 'foo'

type GenerableProps = {[key: string]: Generable}
type GenerableInterface = t.InterfaceType<GenerableProps>
type GenerableStrict = t.StrictType<GenerableProps>
type GenerablePartials = t.PartialType<GenerableProps>
interface GenerableDictionary extends t.RecordType<Generable, Generable> {}
interface GenerableRefinement extends t.RefinementType<Generable> {}
interface GenerableArray extends t.ArrayType<Generable> {}
interface GenerableUnion extends t.UnionType<Array<Generable>> {}
interface GenerableIntersection extends t.IntersectionType<Array<Generable>> {}
interface GenerableTuple extends t.TupleType<Array<Generable>> {}
interface GenerableReadonly extends t.ReadonlyType<Generable> {}
interface GenerableReadonlyArray extends t.ReadonlyArrayType<Generable> {}
interface GenerableRecursive extends t.RecursiveType<Generable> {}
type Generable =
  | t.StringType
  | t.NumberType
  | t.BooleanType
  | GenerableInterface
  | GenerableRefinement
  | GenerableArray
  | GenerableStrict
  | GenerablePartials
  | GenerableDictionary
  | GenerableUnion
  | GenerableIntersection
  | GenerableTuple
  | GenerableReadonly
  | GenerableReadonlyArray
  | t.LiteralType<any>
  | t.KeyofType<any>
  | GenerableRecursive
  | t.UndefinedType

function f(generable: Generable): string {
  switch (generable._tag) {
    case 'InterfaceType':
      return Object.keys(generable.props)
        .map(k => f(generable.props[k]))
        .join('/')
    case 'StringType':
      return 'StringType'
    case 'NumberType':
      return 'StringType'
    case 'BooleanType':
      return 'BooleanType'
    case 'RefinementType':
      return f(generable.type)
    case 'ArrayType':
      return 'ArrayType'
    case 'StrictType':
      return 'StrictType'
    case 'PartialType':
      return 'PartialType'
    case 'RecordType':
      return 'RecordType'
    case 'UnionType':
      return 'UnionType'
    case 'IntersectionType':
      return 'IntersectionType'
    case 'TupleType':
      return generable.types.map(type => f(type)).join('/')
    case 'ReadonlyType':
      return 'ReadonlyType'
    case 'ReadonlyArrayType':
      return 'ReadonlyArrayType'
    case 'LiteralType':
      return 'LiteralType'
    case 'KeyofType':
      return 'KeyofType'
    case 'RecursiveType':
      return f(generable.type)
    case 'UndefinedType':
      return 'UndefinedType'
  }
}

const schema = t.interface({
  a: t.string,
  b: t.union([
    t.partial({
      c: t.string,
      d: t.literal('eee'),
    }),
    t.boolean,
  ]),
  e: t.intersection([
    t.interface({
      f: t.array(t.string),
    }),
    t.interface({
      g: t.union([t.literal('toto'), t.literal('tata')]),
    }),
  ]),
})

f(schema) // OK!
type Rec = {
  a: number
  b: Rec | undefined
}

const Rec = t.recursion<Rec, GenerableInterface>('T', self =>
  t.interface({
    a: t.number,
    b: t.union([self, t.undefined]),
  }),
)

f(Rec) // OK!

//
// tagged union
//
const TU1 = t.taggedUnion('type', [
  t.type({type: t.literal('a')}),
  t.type({type: t.literal('b')}),
])
// $ExpectError
const x36: t.StaticTypeOf<typeof TU1> = true
const x37: t.StaticTypeOf<typeof TU1> = {type: 'a'}
const x38: t.StaticTypeOf<typeof TU1> = {type: 'b'}

//
// custom combinators
//

export function interfaceWithOptionals<
  RequiredProps extends t.Props,
  OptionalProps extends t.Props
>(
  required: RequiredProps,
  optional: OptionalProps,
  name?: string,
): t.IntersectionType<
  [
    t.InterfaceType<RequiredProps, t.TypeOfProps<RequiredProps>>,
    t.PartialType<OptionalProps, t.TypeOfPartialProps<OptionalProps>>
  ],
  t.TypeOfProps<RequiredProps> & t.TypeOfPartialProps<OptionalProps>
> {
  return t.intersection([t.interface(required), t.partial(optional)], name)
}

export function maybe<RT extends t.Any>(
  type: RT,
  name?: string,
): t.UnionType<[RT, t.NullType], t.StaticTypeOf<RT> | null> {
  return t.union<[RT, t.NullType]>([type, t.null], name)
}

const pluck = <
  F extends string,
  U extends t.UnionType<Array<t.InterfaceType<{[K in F]: t.Mixed}>>>
>(
  union: U,
  field: F,
): t.Type<t.StaticTypeOf<U>[F]> => {
  return t.union(union.types.map(type => type.props[field]))
}

export const Action = t.union([
  t.type({
    type: t.literal('Action1'),
    payload: t.type({
      foo: t.string,
    }),
  }),
  t.type({
    type: t.literal('Action2'),
    payload: t.type({
      bar: t.string,
    }),
  }),
])

// ActionType: t.Type<"Action1" | "Action2", "Action1" | "Action2", t.mixed>
const ActionType = pluck(Action, 'type')

//
// AnyType
//

declare const Any1: t.AnyType | t.InterfaceType<any>

//
// exact
//

declare const E1: t.InterfaceType<{a: t.NumberType}, {a: number}>
const E2: t.Type<any> = t.exact(E1)

const C1 = t.type({
  a: t.string,
  b: t.number,
})

interface C1 {
  a: string
  b: number
}

interface C1O {
  a: string
  b: number
}

interface C1WithAdditionalProp {
  a: string
  b: Date
  c: boolean
}

// $-ExpectError @todo
const C2 = t.clean<C1>(C1)
// $ExpectError
const C3 = t.clean<C1WithAdditionalProp, C1O>(C1)
//
const C4 = t.clean<C1>(C1)
const C5 = t.alias(C1)<C1>()
// $ExpectError
const C6 = t.alias(C1)<C1, C1>()
// $ExpectError
const C7 = t.alias(C1)<C1WithAdditionalProp, C1O>()
// @ts-ignore @todo
const C8 = t.alias(C1)<C1, C1O>()

const v: {} = 'hi'
if (t.string.castStatic<number>().is(v)) {
  expectType<number>(v)
  // $ExpectError
  expectType<string>(v)
}

const v2: {} = 'hi'
class A {
  a: true
}
class B {
  b: true
}

if (t.instanceOf<typeof A>(A).is(v2)) {
  expectType<A>(v2)
  // $ExpectError
  expectType<B>(v2)
}

;() => {
  const v: {} = 'hi'
  class A {
    a: true
  }

  if (t.subclassOf(A).is(v)) {
    const t = new v()
    expectType<true>(t.a)
    // $ExpectError
    expectType<string>(t.a)
  }

  const s = t.subclassOf(A)

  const v2: t.StaticTypeOf<typeof s> = A
  const v3: t.StaticTypeOf<typeof s> = class A2 extends A {}
  // $ExpectError
  const v4: t.StaticTypeOf<typeof s> = class A3 {}
}
;() => {
  const v: {} = 'hi'

  if (t.deferred(() => t.number).is(v)) {
    expectType<number>(v)
    // $ExpectError
    expectType<string>(v)
  }
}
;() => {
  const v: {} = 10

  if (t.string.withRuntimeCheck(() => true).is(v)) {
    // $ExpectError
    expectType<number>(v)
    expectType<string>(v)
  }
}
