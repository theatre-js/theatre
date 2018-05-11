import {Either, Left, Right} from 'fp-ts/lib/Either'
import {Predicate} from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    _A: T
  }
}

export type mixed =
  | object
  | number
  | string
  | boolean
  | symbol
  | undefined
  | null

export interface ValidationContextEntry {
  readonly key: string
  readonly type: Type<$IntentionalAny>
}
export type ValidationContext = ReadonlyArray<ValidationContextEntry>
export interface ValidationError {
  readonly value: mixed
  readonly context: ValidationContext
}
export type Errors = Array<ValidationError>
export type Validation = Either<Errors, true>
export type Is<A> = (m: mixed) => m is A
export type Validate = (i: mixed, context: ValidationContext) => Validation
export type Any = Type<$IntentionalAny>
export type Mixed = Type<$IntentionalAny>
export type TypeOf<RT extends Any> = RT['_A']

export class Type<A> {
  readonly _A!: A
  constructor(
    /** a unique name for this runtime type */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate,
  ) {}

  rootValidate(a: mixed): Validation {
    return this.validate(a as $FixMe, getDefaultValidationContext(this)).map(
      (): $FixMe => {
        return true
      },
    )
  }
}

export const identity = <A>(a: A): A => a

export const getFunctionName = (f: Function): string =>
  (f as $IntentionalAny).displayName ||
  (f as $IntentionalAny).name ||
  `<function${f.length}>`

export const getValidationContextEntry = (
  key: string,
  type: Type<$IntentionalAny>,
): ValidationContextEntry => ({key, type})

export const getValidationError = (
  value: mixed,
  context: ValidationContext,
): ValidationError => ({value, context})

export const getDefaultValidationContext = (
  type: Type<$IntentionalAny>,
): ValidationContext => [{key: '', type}]

export const appendValidationContext = (
  c: ValidationContext,
  key: string,
  type: Type<$IntentionalAny>,
): ValidationContext => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = {key, type}
  return r
}

export const failures = (errors: Errors): Validation =>
  new Left<Errors, true>(errors)

export const failure = (value: mixed, context: ValidationContext): Validation =>
  failures([getValidationError(value, context)])

export const success = (): Validation => new Right<Errors, true>(true)

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => {
  const l = ys.length
  for (let i = 0; i < l; i++) {
    xs.push(ys[i])
  }
}

//
// basic types
//

export class NullType extends Type<null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super(
      'null',
      (m): m is null => m === null,
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

/** @alias `null` */
export const nullType: NullType = new NullType()

export class UndefinedType extends Type<undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (m): m is undefined => m === void 0,
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

const undefinedType: UndefinedType = new UndefinedType()

export class AnyType extends Type<$IntentionalAny> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('$IntentionalAny', (_): _ is $IntentionalAny => true, success)
  }
}

export const $IntentionalAny: AnyType = new AnyType()

export class NeverType extends Type<never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super('never', (_): _ is never => false, (m, c) => failure(m, c))
  }
}

export const never: NeverType = new NeverType()

export class StringType extends Type<string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (m): m is string => typeof m === 'string',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const string: StringType = new StringType()

export class NumberType extends Type<number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (m): m is number => typeof m === 'number',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const number: NumberType = new NumberType()

export class BooleanType extends Type<boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (m): m is boolean => typeof m === 'boolean',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const boolean: BooleanType = new BooleanType()

export class AnyArrayType extends Type<Array<mixed>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super(
      'Array',
      Array.isArray,
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType extends Type<{[key: string]: mixed}> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'Dictionary',
      (m): m is {[key: string]: mixed} => m !== null && typeof m === 'object',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class ObjectType extends Type<object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate)
  }
}

export const object: ObjectType = new ObjectType()

export class FunctionType extends Type<Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      // tslint:disable-next-line:strict-type-predicates
      (m): m is Function => typeof m === 'function',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const Function: FunctionType = new FunctionType()

//
// refinements
//

export class RefinementType<RT extends Any, A = $IntentionalAny> extends Type<
  A
> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<RT, A>['is'],
    validate: RefinementType<RT, A>['validate'],
    readonly type: RT,
    readonly predicate: Predicate<A>,
  ) {
    super(name, is, validate)
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name: string = `(${type.name} | ${getFunctionName(predicate)})`,
): RefinementType<RT, TypeOf<RT>> =>
  new RefinementType(
    name,
    (m): m is TypeOf<RT> => type.is(m) && predicate(m),
    (i, c) => {
      const validation = type.validate(i, c)
      if (validation.isLeft()) {
        return validation
      } else {
        return predicate(i) ? success() : failure(i, c)
      }
    },
    type,
    predicate,
  )

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literals
//

export class LiteralType<V extends string | number | boolean> extends Type<V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    readonly value: V,
  ) {
    super(name, is, validate)
  }
}

export const literal = <V extends string | number | boolean>(
  value: V,
  name: string = JSON.stringify(value),
): LiteralType<V> => {
  const is = (m: mixed): m is V => m === value
  return new LiteralType(
    name,
    is,
    (m, c) => (is(m) ? success() : failure(m, c)),
    value,
  )
}

//
// keyof
//

export class KeyofType<D extends {[key: string]: mixed}> extends Type<keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    readonly keys: D,
  ) {
    super(name, is, validate)
  }
}

export const keyof = <D extends {[key: string]: mixed}>(
  keys: D,
  name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`,
): KeyofType<D> => {
  const is = (m: mixed): m is keyof D => string.is(m) && keys.hasOwnProperty(m)
  return new KeyofType(
    name,
    is,
    (m, c) => (is(m) ? success() : failure(m, c)),
    keys,
  )
}

//
// recursive types
//

export class RecursiveType<RT extends Any, A = $IntentionalAny> extends Type<
  A
> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  constructor(
    name: string,
    is: RecursiveType<RT, A>['is'],
    validate: RecursiveType<RT, A>['validate'],
    private runDefinition: () => RT,
  ) {
    super(name, is, validate)
  }
  get type(): RT {
    return this.runDefinition()
  }
}

export const recursion = <A, RT extends Type<A> = Type<A>>(
  name: string,
  definition: (self: RT) => RT,
): RecursiveType<RT, A> => {
  let cache: RT
  const runDefinition = (): RT => {
    if (!cache) {
      cache = definition(Self)
    }
    return cache
  }
  const Self: $IntentionalAny = new RecursiveType<RT, A>(
    name,
    (m): m is A => runDefinition().is(m),
    (m, c) => runDefinition().validate(m, c),
    runDefinition,
  )
  return Self
}

//
// arrays
//

export class ArrayType<RT extends Any, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<RT, A>['is'],
    validate: ArrayType<RT, A>['validate'],
    readonly type: RT,
  ) {
    super(name, is, validate)
  }
}

export const array = <RT extends Mixed>(
  type: RT,
  name: string = `Array<${type.name}>`,
): ArrayType<RT, Array<TypeOf<RT>>> =>
  new ArrayType(
    name,
    (m): m is Array<TypeOf<RT>> => arrayType.is(m) && m.every(type.is),
    (m, c) => {
      const arrayValidation = arrayType.validate(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const xs: Array<$FixMe> = m as $IntentionalAny
        const len = xs.length
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const x = xs[i]
          const validation = type.validate(x, appendValidationContext(c, String(i), type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          }
        }
        return errors.length ? failures(errors) : success()
      }
    },
    type,
  )

//
// interfaces
//

export class InterfaceType<P, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P, A>['is'],
    validate: InterfaceType<P, A>['validate'],
    readonly props: P,
  ) {
    super(name, is, validate)
  }
}

export interface AnyProps {
  [key: string]: Any
}

const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

export type TypeOfProps<P extends AnyProps> = {[K in keyof P]: TypeOf<P[K]>}

export interface Props {
  [key: string]: Mixed
}

/** @alias `interface` */
export const type = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props),
): InterfaceType<P, TypeOfProps<P>> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new InterfaceType(
    name,
    (m): m is TypeOfProps<P> => {
      if (!Dictionary.is(m)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        if (!types[i].is(m[keys[i]])) {
          return false
        }
      }
      return true
    },
    (m, c) => {
      const dictionaryValidation = Dictionary.validate(m, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const errors: Errors = []
        const o: $IntentionalAny = m
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const ok = o[k]
          const type = types[i]
          const validation = type.validate(ok, appendValidationContext(c, k, type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          }
        }
        return errors.length ? failures(errors) : success()
      }
    },

    props,
  )
}

//
// partials
//

export class PartialType<P, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P, A>['is'],
    validate: PartialType<P, A>['validate'],
    readonly props: P,
  ) {
    super(name, is, validate)
  }
}

export type TypeOfPartialProps<P extends AnyProps> = {
  [K in keyof P]?: TypeOf<P[K]>
}

export const partial = <P extends Props>(
  props: P,
  name: string = `PartialType<${getNameFromProps(props)}>`,
): PartialType<P, TypeOfPartialProps<P>> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  const partials: Props = {}
  for (let i = 0; i < len; i++) {
    partials[keys[i]] = union([types[i], undefinedType])
  }
  const partial = type(partials)
  return new PartialType(
    name,
    partial.is as $IntentionalAny,
    partial.validate as $IntentionalAny,
    props,
  )
}

//
// dictionaries
//

export class DictionaryType<
  D extends Any,
  C extends Any,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C, A>['is'],
    validate: DictionaryType<D, C, A>['validate'],
    readonly domain: D,
    readonly codomain: C,
  ) {
    super(name, is, validate)
  }
}

export type TypeOfDictionary<D extends Any, C extends Any> = {
  [K in TypeOf<D>]: TypeOf<C>
}

export const dictionary = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`,
): DictionaryType<D, C, TypeOfDictionary<D, C>> =>
  new DictionaryType(
    name,
    (m): m is TypeOfDictionary<D, C> =>
      Dictionary.is(m) &&
      Object.keys(m).every(k => domain.is(k) && codomain.is(m[k])),
    (m, c) => {
      const dictionaryValidation = Dictionary.validate(m, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const o = m as $IntentionalAny
        const errors: Errors = []
        const keys = Object.keys(o)
        const len = keys.length
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const ok = o[k]
          const domainValidation = domain.validate(
            k,
            appendValidationContext(c, k, domain),
          )
          const codomainValidation = codomain.validate(
            ok,
            appendValidationContext(c, k, codomain),
          )
          if (domainValidation.isLeft()) {
            pushAll(errors, domainValidation.value)
          }
          if (codomainValidation.isLeft()) {
            pushAll(errors, codomainValidation.value)
          }
        }
        return errors.length ? failures(errors) : success()
      }
    },
    domain,
    codomain,
  )

//
// unions
//

export class UnionType<
  RTS extends Array<Any>,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<RTS, A>['is'],
    validate: UnionType<RTS, A>['validate'],
    readonly types: RTS,
  ) {
    super(name, is, validate)
  }
}

export const union = <RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`,
): UnionType<RTS, TypeOf<RTS['_A']>> => {
  const len = types.length
  return new UnionType(
    name,
    (m): m is TypeOf<RTS['_A']> => types.some(type => type.is(m)),
    (m, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(m, appendValidationContext(c, String(i), type))
        if (validation.isRight()) {
          return validation
        } else {
          pushAll(errors, validation.value)
        }
      }
      return failures(errors)
    },
    types,
  )
}

//
// intersections
//

export class IntersectionType<
  RTS extends Array<Any>,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<RTS, A>['is'],
    validate: IntersectionType<RTS, A>['validate'],
    readonly types: RTS,
  ) {
    super(name, is, validate)
  }
}

export function intersection<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed,
  E extends Mixed
>(
  types: [A, B, C, D, E],
  name?: string,
): IntersectionType<
  [A, B, C, D, E],
  TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>
>
export function intersection<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed
>(
  types: [A, B, C, D],
  name?: string,
): IntersectionType<[A, B, C, D], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string,
): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>>
export function intersection<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: string,
): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>>
export function intersection<A extends Mixed>(
  types: [A],
  name?: string,
): IntersectionType<[A], TypeOf<A>>
export function intersection<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' & ')})`,
): IntersectionType<RTS, $IntentionalAny> {
  const len = types.length
  return new IntersectionType(
    name,
    (m): m is $IntentionalAny => types.every(type => type.is(m)),
    (m, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(m, c)
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        }
      }
      return errors.length ? failures(errors) : success()
    },
    types,
  )
}

//
// tuples
//

export class TupleType<
  RTS extends Array<Any>,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<RTS, A>['is'],
    validate: TupleType<RTS, A>['validate'],
    readonly types: RTS,
  ) {
    super(name, is, validate)
  }
}

export function tuple<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed,
  E extends Mixed
>(
  types: [A, B, C, D, E],
  name?: string,
): TupleType<
  [A, B, C, D, E],
  [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>]
>
export function tuple<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed
>(
  types: [A, B, C, D],
  name?: string,
): TupleType<[A, B, C, D], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string,
): TupleType<[A, B, C], [TypeOf<A>, TypeOf<B>, TypeOf<C>]>
export function tuple<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: string,
): TupleType<[A, B], [TypeOf<A>, TypeOf<B>]>
export function tuple<A extends Mixed>(
  types: [A],
  name?: string,
): TupleType<[A], [TypeOf<A>]>
export function tuple<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `[${types.map(type => type.name).join(', ')}]`,
): TupleType<RTS, $IntentionalAny> {
  const len = types.length
  return new TupleType(
    name,
    (m): m is $IntentionalAny =>
      arrayType.is(m) &&
      m.length === len &&
      types.every((type, i) => type.is(m[i])),
    (m, c) => {
      const arrayValidation = arrayType.validate(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const t: Array<$IntentionalAny> = m as $IntentionalAny
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const a = t[i]
          const type = types[i]
          const validation = type.validate(a, appendValidationContext(c, String(i), type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          }
        }
        if (t.length > len) {
          errors.push(
            getValidationError(t[len], appendValidationContext(c, String(len), never)),
          )
        }
        return errors.length ? failures(errors) : success()
      }
    },
    types,
  )
}

//
// readonly objects
//

export class ReadonlyType<RT extends Any, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<RT, A>['is'],
    validate: ReadonlyType<RT, A>['validate'],
    readonly type: RT,
  ) {
    super(name, is, validate)
  }
}

export const readonly = <RT extends Mixed>(
  type: RT,
  name: string = `Readonly<${type.name}>`,
): ReadonlyType<RT, Readonly<TypeOf<RT>>> =>
  new ReadonlyType(name, type.is, (m, c) => type.validate(m, c), type)

//
// readonly arrays
//

export class ReadonlyArrayType<
  RT extends Any,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<RT, A>['is'],
    validate: ReadonlyArrayType<RT, A>['validate'],
    readonly type: RT,
  ) {
    super(name, is, validate)
  }
}

export const readonlyArray = <RT extends Mixed>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`,
): ReadonlyArrayType<RT, ReadonlyArray<TypeOf<RT>>> => {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name,
    arrayType.is,
    (m, c) => arrayType.validate(m, c),
    type,
  )
}

//
// strict types
//

export class StrictType<P, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P, A>['is'],
    validate: StrictType<P, A>['validate'],
    readonly props: P,
  ) {
    super(name, is, validate)
  }
}

/**
 * Specifies that only the given properties are allowed
 * @deprecated use `exact` instead
 */
export const strict = <P extends Props>(
  props: P,
  name: string = `StrictType<${getNameFromProps(props)}>`,
): StrictType<P, TypeOfProps<P>> => {
  const exactType = exact(type(props))
  return new StrictType(name, exactType.is, exactType.validate, props)
}

//
// tagged unions
//

export type TaggedProps<Tag extends string> = {
  [K in Tag]: LiteralType<$IntentionalAny>
}
export interface TaggedRefinement<Tag extends string, A>
  extends RefinementType<Tagged<Tag>, A> {}
export interface TaggedUnion<Tag extends string, A>
  extends UnionType<Array<Tagged<Tag>>, A> {}
export type TaggedIntersectionArgument<Tag extends string> =
  | [Tagged<Tag>]
  | [Tagged<Tag>, Mixed]
  | [Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]
export interface TaggedIntersection<Tag extends string, A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A> {}
export interface TaggedExact<Tag extends string>
  extends ExactType<Tagged<Tag>> {}
export type Tagged<Tag extends string, A = $IntentionalAny> =
  | InterfaceType<TaggedProps<Tag>, A>
  | StrictType<TaggedProps<Tag>, A>
  | TaggedRefinement<Tag, A>
  | TaggedUnion<Tag, A>
  | TaggedIntersection<Tag, A>
  | TaggedExact<Tag>

const isTagged = <Tag extends string>(
  tag: Tag,
): ((type: Mixed) => type is Tagged<Tag>) => {
  const f = (type: Mixed): type is Tagged<Tag> => {
    if (type instanceof InterfaceType || type instanceof StrictType) {
      return type.props.hasOwnProperty(tag)
    } else if (type instanceof IntersectionType) {
      return type.types.some(f)
    } else if (type instanceof UnionType) {
      return type.types.every(f)
    } else if (type instanceof RefinementType) {
      return f(type.type)
    } else {
      return false
    }
  }
  return f
}

const findTagged = <Tag extends string>(
  tag: Tag,
  types: TaggedIntersectionArgument<Tag>,
): Tagged<Tag> => {
  const len = types.length
  const is = isTagged(tag)
  let i = 0
  for (; i < len - 1; i++) {
    const type = types[i]
    if (is(type)) {
      return type
    }
  }
  return types[i] as $IntentionalAny
}

const getTagValue = <Tag extends string>(
  tag: Tag,
): ((type: Tagged<Tag>) => string | number | boolean) => {
  const f = (type: Tagged<Tag>): string => {
    switch (type._tag) {
      case 'InterfaceType':
      case 'StrictType':
        return type.props[tag].value
      case 'IntersectionType':
        return f(findTagged(tag, type.types))
      case 'UnionType':
        return f(type.types[0])
      case 'RefinementType':
      case 'ExactType':
        return f(type.type)
    }
  }
  return f
}

export const taggedUnion = <Tag extends string, RTS extends Array<Tagged<Tag>>>(
  tag: Tag,
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`,
): UnionType<RTS, TypeOf<RTS['_A']>> => {
  const len = types.length
  const values: Array<string | number | boolean> = new Array(len)
  const hash: {[key: string]: number} = {}
  let useHash = true
  const get = getTagValue(tag)
  for (let i = 0; i < len; i++) {
    const value = get(types[i])
    useHash = useHash && string.is(value)
    values[i] = value
    hash[String(value)] = i
  }
  const isTagValue = useHash
    ? (m: mixed): m is string | number | boolean =>
        string.is(m) && hash.hasOwnProperty(m)
    : (m: mixed): m is string | number | boolean =>
        values.indexOf(m as $IntentionalAny) !== -1
  const getIndex: (tag: string | number | boolean) => number = useHash
    ? tag => hash[tag as $IntentionalAny]
    : tag => {
        let i = 0
        for (; i < len - 1; i++) {
          if (values[i] === tag) {
            break
          }
        }
        return i
      }
  const TagValue = new Type(
    values.map(l => JSON.stringify(l)).join(' | '),
    isTagValue,
    (m, c) => (isTagValue(m) ? success() : failure(m, c)),
  )
  return new UnionType<RTS, TypeOf<RTS['_A']>>(
    name,
    (v): v is TypeOf<RTS['_A']> => {
      if (!Dictionary.is(v)) {
        return false
      }
      const tagValue = v[tag]
      return TagValue.is(tagValue) && types[getIndex(tagValue)].is(v)
    },
    (s, c) => {
      const dictionaryValidation = Dictionary.validate(s, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const d = s as $IntentionalAny
        const tagValueValidation = TagValue.validate(
          d[tag],
          appendValidationContext(c, tag, TagValue),
        )
        if (tagValueValidation.isLeft()) {
          return tagValueValidation
        } else {
          const i = getIndex(d[tag])
          const type = types[i]
          return type.validate(d, appendValidationContext(c, String(i), type))
        }
      }
    },
    types,
  )
}

//
// exact types
//

export class ExactType<RT extends Any, A = $IntentionalAny> extends Type<A> {
  readonly _tag: 'ExactType' = 'ExactType'
  constructor(
    name: string,
    is: ExactType<RT, A>['is'],
    validate: ExactType<RT, A>['validate'],
    readonly type: RT,
  ) {
    super(name, is, validate)
  }
}

export interface HasPropsRefinement
  extends RefinementType<HasProps, $IntentionalAny> {}
export interface HasPropsReadonly
  extends ReadonlyType<HasProps, $IntentionalAny> {}
export interface HasPropsIntersection
  extends IntersectionType<Array<HasProps>, $IntentionalAny> {}
export type HasProps =
  | HasPropsRefinement
  | HasPropsReadonly
  | HasPropsIntersection
  | InterfaceType<$IntentionalAny, $IntentionalAny>
  | StrictType<$IntentionalAny, $IntentionalAny>
  | PartialType<$IntentionalAny, $IntentionalAny>

// typings-checker doesn't know Object.assign
const assign = (Object as $IntentionalAny).assign

const getProps = (type: HasProps): Props => {
  switch (type._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(type.type)
    case 'InterfaceType':
    case 'StrictType':
    case 'PartialType':
      return type.props
    case 'IntersectionType':
      return type.types.reduce<Props>(
        (props, type) => assign(props, getProps(type)),
        {},
      )
  }
}

export function exact<RT extends HasProps>(
  type: RT,
  name: string = `ExactType<${type.name}>`,
): ExactType<RT, TypeOf<RT>> {
  const props: Props = getProps(type)
  return new ExactType(
    name,
    (m): m is TypeOf<RT> =>
      type.is(m) &&
      Object.getOwnPropertyNames(m).every(k => props.hasOwnProperty(k)),
    (m, c) => {
      const looseValidation = type.validate(m, c)
      if (looseValidation.isLeft()) {
        return looseValidation
      } else {
        const o: $IntentionalAny = m
        const keys = Object.getOwnPropertyNames(o)
        const len = keys.length
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const key = keys[i]
          if (!props.hasOwnProperty(key)) {
            errors.push(
              getValidationError(o[key], appendValidationContext(c, key, never)),
            )
          }
        }
        return errors.length ? failures(errors) : success()
      }
    },
    type,
  )
}

/** Drops the runtime type "kind" */
export function clean<A>(type: Type<A>): Type<A> {
  return type as $IntentionalAny
}

export type PropsOf<T extends {props: $IntentionalAny}> = T['props']

export type Exact<T, X extends T> = T &
  {
    [K in ({[K in keyof X]: K} &
      {[K in keyof T]: never} & {[key: string]: never})[keyof X]]?: never
  }

/** Keeps the runtime type "kind" */
export function alias<A, P>(
  type: PartialType<P, A>,
): <AA extends Exact<A, AA>, PP extends Exact<P, PP> = P>() => PartialType<
  PP,
  AA
>
export function alias<A, P>(
  type: StrictType<P, A>,
): <AA extends Exact<A, AA>, PP extends Exact<P, PP> = P>() => StrictType<
  PP,
  AA
>
export function alias<A, P>(
  type: InterfaceType<P, A>,
): <AA extends Exact<A, AA>, PP extends Exact<P, PP> = P>() => InterfaceType<
  PP,
  AA
>
export function alias<A>(
  type: Type<A>,
): <AA extends Exact<A, AA>>() => Type<AA> {
  return type as $IntentionalAny
}

export {
  nullType as null,
  undefinedType as undefined,
  arrayType as Array,
  type as interface,
}

export const intentionalAny = $IntentionalAny
export const fixMe = $IntentionalAny

export function maybe<RT extends Any>(
  type: RT,
  name?: string,
): UnionType<[RT, NullType], TypeOf<RT> | null> {
  return union<[RT, NullType]>([type, nullType], name)
}
