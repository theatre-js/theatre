import * as t from '$shared/ioTypes'
import {TypeOf} from '$shared/ioTypes'
//
// clean / alias
//
import {DateFromNumber} from './testHelpers'

//
// recursion
//
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
// $ExpectError
const Rec2 = t.recursion<string>('T', Self =>
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
const x1: TypeOf<typeof L1> = 's'
const x2: TypeOf<typeof L1> = 'a'

//
// keyof
//

const K1 = t.keyof({a: true, b: true})
// $ExpectError
const x3: TypeOf<typeof K1> = 's'
const x4: TypeOf<typeof K1> = 'a'
const x5: TypeOf<typeof K1> = 'b'

//
// default types
//

// $ExpectError
undefined as TypeOf<typeof t.null>
null as TypeOf<typeof t.null>

// $ExpectError
null as TypeOf<typeof t.undefined>
undefined as TypeOf<typeof t.undefined>

// $ExpectError
1 as TypeOf<typeof t.string>
's' as TypeOf<typeof t.string>

//
// refinement
//

const R1 = t.refinement(t.number, n => n % 2 === 0)
// $ExpectError
's' as TypeOf<typeof R1>
2 as TypeOf<typeof R1>

//
// array
//

const A1 = t.array(t.number)
// $ExpectError
's' as TypeOf<typeof A1>
// $ExpectError
['s'] as TypeOf<typeof A1>
[1] as TypeOf<typeof A1>

//
// interface
//

const I1 = t.interface({name: t.string, age: t.number})
// $ExpectError
const x6: TypeOf<typeof I1> = {}
// $ExpectError
const x7: TypeOf<typeof I1> = {name: 'name'}
// $ExpectError
const x8: TypeOf<typeof I1> = {age: 43}
const x9: TypeOf<typeof I1> = {name: 'name', age: 43}

const I2 = t.interface({
  name: t.string,
  father: t.interface({surname: t.string}),
})
type I2T = TypeOf<typeof I2>
// $ExpectError
const x10: I2T = {name: 'name', father: {}}
const x11: I2T = {name: 'name', father: {surname: 'surname'}}

//
// dictionary
//

const D1 = t.dictionary(t.keyof({a: true}), t.number)
// $ExpectError
const x12: TypeOf<typeof D1> = {a: 's'}
// $ExpectError
const x12_2: TypeOf<typeof D1> = {c: 1}
const x13: TypeOf<typeof D1> = {a: 1}

//
// union
//

const U1 = t.union([t.string, t.number])
// $ExpectError
const x14: TypeOf<typeof U1> = true
const x15: TypeOf<typeof U1> = 's'
const x16: TypeOf<typeof U1> = 1

//
// intersection
//

const IN1 = t.intersection([
  t.interface({a: t.number}),
  t.interface({b: t.string}),
])
// $ExpectError
const x17: TypeOf<typeof IN1> = {a: 1}
const x18: TypeOf<typeof IN1> = {a: 1, b: 's'}

//
// tuple
//

const T1 = t.tuple([t.string, t.number])
// $ExpectError
const x19: TypeOf<typeof T1> = ['s', true]
const x20: TypeOf<typeof T1> = ['s', 1]

//
// partial
//

const P1 = t.partial({name: t.string})
type P1T = TypeOf<typeof P1>
// $ExpectError
const x21: P1T = {name: 1}
const x22: P1T = {}
const x23: P1T = {name: 's'}

//
// readonly
//

const RO1 = t.readonly(t.interface({name: t.string}))
const x24: TypeOf<typeof RO1> = {name: 's'}
// $ExpectError
x24.name = 's2'
// $ExpectError
const x25: TypeOf<typeof RO1> = {name: 1}

//
// readonlyArray
//

const ROA1 = t.readonlyArray(t.number)
// $ExpectError
const x26: TypeOf<typeof ROA1> = ['s']
const x27: TypeOf<typeof ROA1> = [1]
// $ExpectError
x27[0] = 2
// $ExpectError
x27.push(2)

//
// strict
//

const S1 = t.strict({name: t.string})
type TS1 = TypeOf<typeof S1>
const x32: TS1 = {name: 'Giulio'}
const x33input = {name: 'foo', foo: 'foo'}
const x33: TS1 = x33input
// $ExpectError
const S2 = t.strict(t.string)

//
// object
//
const O1 = t.object
type TO1 = TypeOf<typeof O1>
const x34: TO1 = {name: 'Giulio'}
// $ExpectError
const x35: TO1 = 'foo'

type GenerableProps = {[key: string]: Generable}
type GenerableInterface = t.InterfaceType<GenerableProps>
type GenerableStrict = t.StrictType<GenerableProps>
type GenerablePartials = t.PartialType<GenerableProps>
interface GenerableDictionary extends t.DictionaryType<Generable, Generable> {}
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
    case 'DictionaryType':
      return 'DictionaryType'
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

const Rec = t.recursion<Rec, Rec, t.mixed, GenerableInterface>('T', self =>
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
const x36: TypeOf<typeof TU1> = true
const x37: TypeOf<typeof TU1> = {type: 'a'}
const x38: TypeOf<typeof TU1> = {type: 'b'}

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
): t.UnionType<
  [RT, t.NullType],
  t.TypeOf<RT> | null,
  t.OutputOf<RT> | null,
  t.InputOf<RT> | null
> {
  return t.union<[RT, t.NullType]>([type, t.null], name)
}

const pluck = <
  F extends string,
  U extends t.UnionType<Array<t.InterfaceType<{[K in F]: t.Mixed}>>>
>(
  union: U,
  field: F,
): t.Type<t.TypeOf<U>[F]> => {
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

declare const E1: t.InterfaceType<
  {a: t.NumberType},
  {a: number},
  {a: number},
  {a: number}
>
const E2: t.Type<any, any, {a: number}> = t.exact(E1)

const C1 = t.type({
  a: t.string,
  b: DateFromNumber,
})

interface C1 {
  a: string
  b: Date
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

// $ExpectError
const C2 = t.clean<C1>(C1)
// $ExpectError
const C3 = t.clean<C1WithAdditionalProp, C1O>(C1)
const C4 = t.clean<C1, C1O>(C1)
const C5 = t.alias(C1)<C1>()
// $ExpectError
const C6 = t.alias(C1)<C1, C1>()
// $ExpectError
const C7 = t.alias(C1)<C1WithAdditionalProp, C1O>()
const C8 = t.alias(C1)<C1, C1O>()
