# ioTypes

These are our own implementation of runtime types (a fork of [gcanti/io-types](gcanti/io-types)). 

## Usage

```
import * as t from '$shared/ioTypes`
```

| Typescript | ioType |
| --- | --- |
| `string, number, boolean` | `t.string, t.number, t.boolean` |
| `undefined, null` | `t.undefined, t.null` |
| `'foo'` | `t.literal('foo')` |
| `{foo: string}` | `t.type({foo: t.string})` |
| `{foo?: string}` | `t.type({foo: t.optional(t.string)})` |
| `string | number` | `t.union([t.string, t.number])` |
| `A & B` | `t.intersection([A, B])` |
| `Record<string, number>` | `t.record(t.string, t.number)` |
| `Array<string>` | `t.array(t.string)` |
| `keyof A` | `t.keyOf(A)` |

## Checking conformity

```
t.string.is('foo') // true
t.string.is(10) // false
```

## Circular dependency types

This is legal in typescript:
```
type A = {
  foo: A
}
```

But expressing it in ioTypes would be an error:

```
const $A = t.type({
  foo: $A // Error: $A is not defined yet
})
```

This is where `t.deferred()` comes in. `t.deferred($A)` is basically the same as `$A`, with the only difference being that the value of `$A` is resolved only when it is actually needed. This allows you to break cirular dependencies. Example:

```
const $A = t.type({
  foo: t.deferred($A) // Fine!
})
```

## Deriving static typescript types from ioTypes

```
const $A = t.type({foo: t.string})

type A = t.StaticType<typeof $A> // same as type A = {foo: string}
```

## Additional runtime checks

Imagine you want to limit a number type only to positive numbers:

```
const $PositiveNumber = t.number.refinement((v) => v >= 0)
$PositiveNumber.is(10) // true
$PositiveNumber.is(-10) // false
```

All types have a `.refinement()` method that takes a function from a value, to a boolean. If the function returns true, the refinement passes.

## Conventions

#### 1: Use sparingly

So far we're only using ioTypes to check the type of the redux store. We avoid using it in other places, simply because it's more verbose than typescript. 

One way to make ioTypes usable in the rest of the codebase is to make a transpiler (using babel >= 7) that transpiles regular typescript type annotations to ioTypes.


#### 2: Prefix each type name with `$`

```
const $A = t.type(...)`
```

#### 3: Always export the normal typescript type alongside the ioType

```
export cosnt $A = t.type(...)
export type A = t.StaticType<typeof $A>
```
