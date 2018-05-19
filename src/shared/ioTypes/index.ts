import {Either, Left, Right} from 'fp-ts/lib/Either'
import {Predicate} from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    StaticType: T
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
  readonly value: mixed
}
export type ValidationContext = ReadonlyArray<ValidationContextEntry>
export interface ValidationError {
  readonly value: mixed
  readonly context: ValidationContext
  readonly extraInfo?: mixed
}
export type Errors = Array<ValidationError>
export type Validation = Either<Errors, true>
export type Is<A> = (m: mixed) => m is A
export type Validate = (i: mixed, context: ValidationContext) => Validation
export type Any = Type<$IntentionalAny>
export type Mixed = Type<$IntentionalAny>
export type StaticTypeOf<RT extends Any> = RT['StaticType']

type TypeName = string | (() => string)

export class Type<A> {
  readonly StaticType!: A
  // abstract _name: string
  constructor(
    /** a unique name for this runtime type */
    readonly _name: TypeName,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly _validateWithContext: Validate,
  ) {}

  validate(
    value: mixed,
    validationContext = getDefaultValidationContext(this, value),
  ): Validation {
    return this._validateWithContext(value as $FixMe, validationContext)
  }

  _resolvedName: undefined | string = undefined
  get name() {
    if (this._resolvedName) {
      return this._resolvedName
    } else {
      this._resolvedName =
        typeof this._name === 'string' ? this._name : this._name()
      return this._resolvedName
    }
  }

  /**
   * This is to override the static type in case in can't be properly inferred.
   */
  castStatic<T>(): Type<T> {
    return this as $IntentionalAny
  }

  refinement(predicate: Predicate<StaticTypeOf<this>>, name?: TypeName) {
    return refinement(this, predicate, name)
  }

  withInvariant(
    condition: InvariantCondition<A>,
    name: undefined | TypeName = undefined,
  ): InvariantType<A, Type<A>> {
    return withInvariant(this, condition, name)
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
  value: mixed
): ValidationContextEntry => ({key, type, value})

export const getValidationError = (
  value: mixed,
  context: ValidationContext,
  extraInfo?: mixed,
): ValidationError => ({value, context, extraInfo})

export const getDefaultValidationContext = (
  type: Type<$IntentionalAny>,
  value: mixed
): ValidationContext => [{key: '', type, value}]

export const appendValidationContext = (
  c: ValidationContext,
  key: string,
  type: Type<$IntentionalAny>,
  value: mixed
): ValidationContext => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = {key, type, value}
  return r
}

export const failures = (errors: Errors): Validation =>
  new Left<Errors, true>(errors)

export const failure = (
  value: mixed,
  context: ValidationContext,
  extraInfo?: mixed,
): Validation => failures([getValidationError(value, context, extraInfo)])

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

export class AnyRecordType extends Type<{[key: string]: mixed}> {
  readonly _tag: 'AnyRecordType' = 'AnyRecordType'
  constructor() {
    super(
      'Record',
      (m): m is {[key: string]: mixed} => m !== null && typeof m === 'object',
      (m, c) => (this.is(m) ? success() : failure(m, c)),
    )
  }
}

export const $Record: AnyRecordType = new AnyRecordType()

export class ObjectType extends Type<object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', $Record.is, $Record._validateWithContext)
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
    name: TypeName,
    is: RefinementType<RT, A>['is'],
    _validateWithContext: RefinementType<RT, A>['_validateWithContext'],
    readonly type: RT,
    readonly predicate: Predicate<A>,
  ) {
    super(name, is, _validateWithContext)
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<StaticTypeOf<RT>>,
  name: TypeName = () => `(${type.name} | ${getFunctionName(predicate)})`,
): RefinementType<RT, StaticTypeOf<RT>> =>
  new RefinementType(
    name,
    (m): m is StaticTypeOf<RT> => type.is(m) && predicate(m),
    (i, c) => {
      const validation = type._validateWithContext(i, c)
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
    _validateWithContext: LiteralType<V>['_validateWithContext'],
    readonly value: V,
  ) {
    super(name, is, _validateWithContext)
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
    _validateWithContext: KeyofType<D>['_validateWithContext'],
    readonly keys: D,
  ) {
    super(name, is, _validateWithContext)
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
    _validateWithContext: RecursiveType<RT, A>['_validateWithContext'],
    private runDefinition: () => RT,
  ) {
    super(name, is, _validateWithContext)
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
    (m, c) => runDefinition()._validateWithContext(m, c),
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
    _validateWithContext: ArrayType<RT, A>['_validateWithContext'],
    readonly type: RT,
  ) {
    super(name, is, _validateWithContext)
  }
}

export const array = <RT extends Mixed>(
  type: RT,
  name: string = `Array<${type.name}>`,
): ArrayType<RT, Array<StaticTypeOf<RT>>> =>
  new ArrayType(
    name,
    (m): m is Array<StaticTypeOf<RT>> => arrayType.is(m) && m.every(type.is),
    (m, c) => {
      const arrayValidation = arrayType._validateWithContext(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const xs: Array<$FixMe> = m as $IntentionalAny
        const len = xs.length
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const x = xs[i]
          const validation = type._validateWithContext(
            x,
            appendValidationContext(c, String(i), type, x),
          )
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
    name: TypeName,
    is: InterfaceType<P, A>['is'],
    _validateWithContext: InterfaceType<P, A>['_validateWithContext'],
    readonly props: P,
  ) {
    super(name, is, _validateWithContext)
  }
}

export interface AnyProps {
  [key: string]: Any
}

const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

export type TypeOfProps<P extends AnyProps> = {[K in keyof P]: StaticTypeOf<P[K]>}

export interface Props {
  [key: string]: Mixed
}

/** @alias `interface` */
export const type = <P extends Props>(
  props: P,
  name: TypeName = () => getNameFromProps(props),
): InterfaceType<P, TypeOfProps<P>> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new InterfaceType(
    name,
    (m): m is TypeOfProps<P> => {
      if (!$Record.is(m)) {
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
      const recordValidation = $Record._validateWithContext(m, c)
      if (recordValidation.isLeft()) {
        return recordValidation
      } else {
        const errors: Errors = []
        const o: $IntentionalAny = m
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const ok = o[k]
          const type = types[i]
          const validation = type._validateWithContext(
            ok,
            appendValidationContext(c, k, type, ok),
          )
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
    name: TypeName,
    is: PartialType<P, A>['is'],
    _validateWithContext: PartialType<P, A>['_validateWithContext'],
    readonly props: P,
  ) {
    super(name, is, _validateWithContext)
  }
}

export type TypeOfPartialProps<P extends AnyProps> = {
  [K in keyof P]?: StaticTypeOf<P[K]>
}

export const partial = <P extends Props>(
  props: P,
  name: TypeName = () => `PartialType<${getNameFromProps(props)}>`,
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
    partial._validateWithContext as $IntentionalAny,
    props,
  )
}

//
// records
//

export class RecordType<
  D extends Any,
  C extends Any,
  A = $IntentionalAny
> extends Type<A> {
  readonly _tag: 'RecordType' = 'RecordType'
  constructor(
    name: TypeName,
    is: RecordType<D, C, A>['is'],
    _validateWithContext: RecordType<D, C, A>['_validateWithContext'],
    readonly domain: D,
    readonly codomain: C,
  ) {
    super(name, is, _validateWithContext)
  }
}

export type TypeOfRecord<D extends Any, C extends Any> = {
  [K in StaticTypeOf<D>]: StaticTypeOf<C>
}

export const record = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: () => string = () => `{ [K in ${domain.name}]: ${codomain.name} }`,
): RecordType<D, C, TypeOfRecord<D, C>> =>
  new RecordType(
    name,
    (m): m is TypeOfRecord<D, C> =>
      $Record.is(m) &&
      Object.keys(m).every(k => domain.is(k) && codomain.is(m[k])),
    (m, c) => {
      const recordValidation = $Record._validateWithContext(m, c)
      if (recordValidation.isLeft()) {
        return recordValidation
      } else {
        const o = m as $IntentionalAny
        const errors: Errors = []
        const keys = Object.keys(o)
        const len = keys.length
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const ok = o[k]
          const domainValidation = domain._validateWithContext(
            k,
            appendValidationContext(c, k, domain, ok),
          )
          const codomainValidation = codomain._validateWithContext(
            ok,
            appendValidationContext(c, k, codomain, ok),
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
    name: TypeName,
    is: UnionType<RTS, A>['is'],
    _validateWithContext: UnionType<RTS, A>['_validateWithContext'],
    readonly types: RTS,
  ) {
    super(name, is, _validateWithContext)
  }
}

export const union = <RTS extends Array<Mixed>>(
  types: RTS,
  name: TypeName = () => `(${types.map(type => type.name).join(' | ')})`,
): UnionType<RTS, StaticTypeOf<RTS['StaticType']>> => {
  const len = types.length
  return new UnionType(
    name,
    (m): m is StaticTypeOf<RTS['StaticType']> => types.some(type => type.is(m)),
    (m, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type._validateWithContext(
          m,
          // c
          appendValidationContext(c, '::' + String(i), type, m),
        )
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
    name: TypeName,
    is: IntersectionType<RTS, A>['is'],
    _validateWithContext: IntersectionType<RTS, A>['_validateWithContext'],
    readonly types: RTS,
  ) {
    super(name, is, _validateWithContext)
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
  name?: TypeName,
): IntersectionType<
  [A, B, C, D, E],
  StaticTypeOf<A> & StaticTypeOf<B> & StaticTypeOf<C> & StaticTypeOf<D> & StaticTypeOf<E>
>
export function intersection<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed
>(
  types: [A, B, C, D],
  name?: TypeName,
): IntersectionType<[A, B, C, D], StaticTypeOf<A> & StaticTypeOf<B> & StaticTypeOf<C> & StaticTypeOf<D>>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: TypeName,
): IntersectionType<[A, B, C], StaticTypeOf<A> & StaticTypeOf<B> & StaticTypeOf<C>>
export function intersection<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: TypeName,
): IntersectionType<[A, B], StaticTypeOf<A> & StaticTypeOf<B>>
export function intersection<A extends Mixed>(
  types: [A],
  name?: TypeName,
): IntersectionType<[A], StaticTypeOf<A>>
export function intersection<RTS extends Array<Mixed>>(
  types: RTS,
  name: TypeName = () => `(${types.map(type => type.name).join(' & ')})`,
): IntersectionType<RTS, $IntentionalAny> {
  const len = types.length
  return new IntersectionType(
    name,
    (m): m is $IntentionalAny => types.every(type => type.is(m)),
    (m, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type._validateWithContext(m, c)
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
    name: TypeName,
    is: TupleType<RTS, A>['is'],
    _validateWithContext: TupleType<RTS, A>['_validateWithContext'],
    readonly types: RTS,
  ) {
    super(name, is, _validateWithContext)
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
  name?: TypeName,
): TupleType<
  [A, B, C, D, E],
  [StaticTypeOf<A>, StaticTypeOf<B>, StaticTypeOf<C>, StaticTypeOf<D>, StaticTypeOf<E>]
>
export function tuple<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed
>(
  types: [A, B, C, D],
  name?: TypeName,
): TupleType<[A, B, C, D], [StaticTypeOf<A>, StaticTypeOf<B>, StaticTypeOf<C>, StaticTypeOf<D>]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: TypeName,
): TupleType<[A, B, C], [StaticTypeOf<A>, StaticTypeOf<B>, StaticTypeOf<C>]>
export function tuple<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: TypeName,
): TupleType<[A, B], [StaticTypeOf<A>, StaticTypeOf<B>]>
export function tuple<A extends Mixed>(
  types: [A],
  name?: TypeName,
): TupleType<[A], [StaticTypeOf<A>]>
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
      const arrayValidation = arrayType._validateWithContext(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const t: Array<$IntentionalAny> = m as $IntentionalAny
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const a = t[i]
          const type = types[i]
          const validation = type._validateWithContext(
            a,
            appendValidationContext(c, String(i), type, a),
          )
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          }
        }
        if (t.length > len) {
          errors.push(
            getValidationError(
              t[len],
              appendValidationContext(c, String(len), never, m),
            ),
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
    _validateWithContext: ReadonlyType<RT, A>['_validateWithContext'],
    readonly type: RT,
  ) {
    super(name, is, _validateWithContext)
  }
}

export const readonly = <RT extends Mixed>(
  type: RT,
  name: string = `Readonly<${type.name}>`,
): ReadonlyType<RT, Readonly<StaticTypeOf<RT>>> =>
  new ReadonlyType(
    name,
    type.is,
    (m, c) => type._validateWithContext(m, c),
    type,
  )

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
    _validateWithContext: ReadonlyArrayType<RT, A>['_validateWithContext'],
    readonly type: RT,
  ) {
    super(name, is, _validateWithContext)
  }
}

export const readonlyArray = <RT extends Mixed>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`,
): ReadonlyArrayType<RT, ReadonlyArray<StaticTypeOf<RT>>> => {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name,
    arrayType.is,
    (m, c) => arrayType._validateWithContext(m, c),
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
    _validateWithContext: StrictType<P, A>['_validateWithContext'],
    readonly props: P,
  ) {
    super(name, is, _validateWithContext)
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
  return new StrictType(
    name,
    exactType.is,
    exactType._validateWithContext,
    props,
  )
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
  | InvariantType<A, Type<A>>

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
      case 'InvariantType':
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
): UnionType<RTS, StaticTypeOf<RTS['StaticType']>> => {
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
  return new UnionType<RTS, StaticTypeOf<RTS['StaticType']>>(
    name,
    (v): v is StaticTypeOf<RTS['StaticType']> => {
      if (!$Record.is(v)) {
        return false
      }
      const tagValue = v[tag]
      return TagValue.is(tagValue) && types[getIndex(tagValue)].is(v)
    },
    (s, c) => {
      const recordValidation = $Record._validateWithContext(s, c)
      if (recordValidation.isLeft()) {
        return recordValidation
      } else {
        const d = s as $IntentionalAny
        const tagValueValidation = TagValue._validateWithContext(
          d[tag],
          appendValidationContext(c, tag, TagValue, s),
        )
        if (tagValueValidation.isLeft()) {
          return tagValueValidation
        } else {
          const i = getIndex(d[tag])
          const type = types[i]
          return type._validateWithContext(
            d,
            appendValidationContext(c, String(i), type, s),
          )
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
    _validateWithContext: ExactType<RT, A>['_validateWithContext'],
    readonly type: RT,
  ) {
    super(name, is, _validateWithContext)
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
): ExactType<RT, StaticTypeOf<RT>> {
  const props: Props = getProps(type)
  return new ExactType(
    name,
    (m): m is StaticTypeOf<RT> =>
      type.is(m) &&
      Object.getOwnPropertyNames(m).every(k => props.hasOwnProperty(k)),
    (m, c) => {
      const looseValidation = type._validateWithContext(m, c)
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
              getValidationError(
                o[key],
                appendValidationContext(c, key, never, o[key]),
              ),
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
  name?: TypeName,
): UnionType<[RT, NullType], StaticTypeOf<RT> | null> {
  return union<[RT, NullType]>([type, nullType], name)
}

class OptionalType<T, Rt extends Type<T>> extends Type<T | undefined> {
  _tag: 'OptionalType' = 'OptionalType'
  constructor(type: Rt) {
    super(name, is, _validateWithContext)
    function name(this: OptionalType<T, Rt>) {
      return `Optional<${type.name}>`
    }
    function is(v: mixed): v is T | undefined {
      return typeof v === 'undefined' || type.is(v)
    }
    function _validateWithContext(
      v: mixed,
      c: ValidationContext,
    ) {
      return typeof v === 'undefined' ? success() : type._validateWithContext(v, c)
    }
  }
}

export function optional<T, Rt extends Type<T>>(type: Rt): OptionalType<T, Rt> {
  return new OptionalType(type)
}

type Instantiable = new (...args: $IntentionalAny[]) => $IntentionalAny

class InstanceOfClass<Cls extends Instantiable> extends Type<
  InstanceType<Cls>
> {
  readonly _tag = 'InstanceOf'
  constructor(name: string, cls: Cls) {
    super(
      name,
      (v): v is InstanceType<Cls> => v instanceof cls,
      (v, c) => {
        return this.is(v) ? success() : failure(v, c)
      },
    )
  }
}

export const instanceOf = <Cls extends Instantiable>(
  cls: Cls,
): Type<InstanceType<Cls>> => {
  return new InstanceOfClass(`instanceOf<${getFunctionName(cls)}>`, cls)
}

class SubclassOf<Cls extends Instantiable> extends Type<Cls> {
  readonly _tag = 'SubclassOf'
  constructor(name: string, cls: Cls) {
    super(
      name,
      (v: Instantiable): v is Cls =>
        (typeof v === 'function' && v.prototype instanceof cls) || v === cls,
      (v, c) => {
        return this.is(v) ? success() : failure(v, c)
      },
    )
  }
}

export const subclassOf = <Cls extends Instantiable>(
  cls: Cls,
): SubclassOf<Cls> => {
  return new SubclassOf(`subclassOf<${getFunctionName(cls)}>`, cls)
}

export class DeferredType<A> extends Type<A> {
  _cachedType: Type<A> | undefined

  constructor(readonly _resolveType: () => Type<A>) {
    super(
      function name(this: DeferredType<A>) {
        return this.getType().name
      },
      function is(this: DeferredType<A>, v: {}): v is A {
        return this.getType().is(v)
      },
      function _validateWithContext(
        this: DeferredType<A>,
        v: mixed,
        c: ValidationContext,
      ) {
        return this.getType()._validateWithContext(v, c)
      },
    )
  }

  getType(): Type<A> {
    if (this._cachedType) return this._cachedType
    this._cachedType = this._resolveType()
    return this._cachedType
  }
}

export const deferred = <A>(resolveType: () => Type<A>): Type<A> => {
  const Self: $IntentionalAny = new DeferredType<A>(resolveType)
  return Self
}

type InvariantCondition<T> = (v: T, c?: ValidationContext) => true | string[]

export class InvariantType<A, Rt extends Type<A>> extends Type<A> {
  readonly _tag: 'InvariantType' = 'InvariantType'

  get type(): Type<A> {
    return this.inner
  }
  constructor(
    name: TypeName,
    readonly inner: Type<A>,
    readonly condition: InvariantCondition<A>,
  ) {
    super(
      name,
      function is(this: InvariantType<A, Rt>, v: mixed): v is A {
        if (!this.inner.is(v)) return false
        return this.condition(v) === true
      },
      function _validateWithContext(
        this: InvariantType<A, Rt>,
        v: mixed,
        c: ValidationContext,
      ) {
        return this.inner._validateWithContext(v, c).chain(() => {
          const conditionResult = this.condition(v as A, c)
          if (conditionResult === true) return success()
          return failure(v, c, conditionResult)
        })
      },
    )
  }
}

export const withInvariant = <T, Rt extends Type<T>>(
  inner: Rt,
  condition: InvariantCondition<T>,
  name: TypeName = () => `invariant<${inner.name}>`,
): InvariantType<T, Rt> => {
  return new InvariantType(name, inner, condition)
}
