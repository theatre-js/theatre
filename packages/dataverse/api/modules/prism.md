[@theatre/dataverse](../README.md) / prism

# Namespace: prism

Creates a prism from the passed function that adds all prisms referenced
in it as dependencies, and reruns the function when these change.

**`Param`**

The function to rerun when the prisms referenced in it change.

## Table of contents

### Variables

- [effect](prism.md#effect)
- [ensurePrism](prism.md#ensureprism)
- [inPrism](prism.md#inprism)
- [memo](prism.md#memo)
- [ref](prism.md#ref)
- [scope](prism.md#scope)
- [source](prism.md#source)
- [state](prism.md#state)
- [sub](prism.md#sub)

## Variables

### effect

• **effect**: (`key`: `string`, `cb`: () => () => `void`, `deps?`: `unknown`[]) => `void`

#### Type declaration

▸ (`key`, `cb`, `deps?`): `void`

An effect hook, similar to React's `useEffect()`, but is not sensitive to call order by using `key`.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | the key for the effect. Should be uniqe inside of the prism. |
| `cb` | () => () => `void` | the callback function. Requires returning a cleanup function. |
| `deps?` | `unknown`[] | the dependency array |

##### Returns

`void`

#### Defined in

[prism/prism.ts:885](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L885)

___

### ensurePrism

• **ensurePrism**: () => `void`

#### Type declaration

▸ (): `void`

This is useful to make sure your code is running inside a `prism()` call.

##### Returns

`void`

**`Example`**

```ts
import {prism} from '@theatre/dataverse'

function onlyUsefulInAPrism() {
  prism.ensurePrism()
}

prism(() => {
  onlyUsefulInAPrism() // will run fine
})

setTimeout(() => {
  onlyUsefulInAPrism() // throws an error
  console.log('This will never get logged')
}, 0)
```

#### Defined in

[prism/prism.ts:887](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L887)

___

### inPrism

• **inPrism**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

true if the current function is running inside a `prism()` call.

#### Defined in

[prism/prism.ts:891](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L891)

___

### memo

• **memo**: <T\>(`key`: `string`, `fn`: () => `T`, `deps`: `undefined` \| `any`[] \| readonly `any`[]) => `T`

#### Type declaration

▸ <`T`\>(`key`, `fn`, `deps`): `T`

`prism.memo()` works just like React's `useMemo()` hook. It's a way to cache the result of a function call.
The only difference is that `prism.memo()` requires a key to be passed into it, whlie `useMemo()` doesn't.
This means that we can call `prism.memo()` in any order, and we can call it multiple times with the same key.

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key for the memo. Should be unique inside of the prism |
| `fn` | () => `T` | The function to memoize |
| `deps` | `undefined` \| `any`[] \| readonly `any`[] | The dependency array. Provide `[]` if you want to the value to be memoized only once and never re-calculated. |

##### Returns

`T`

The result of the function call

**`Example`**

```ts
const pr = prism(() => {
 const memoizedReturnValueOfExpensiveFn = prism.memo("memo1", expensiveFn, [])
})
```

#### Defined in

[prism/prism.ts:886](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L886)

___

### ref

• **ref**: <T\>(`key`: `string`, `initialValue`: `T`) => `IRef`<`T`\>

#### Type declaration

▸ <`T`\>(`key`, `initialValue`): `IRef`<`T`\>

Just like React's `useRef()`, `prism.ref()` allows us to create a prism that holds a reference to some value.
The only difference is that `prism.ref()` requires a key to be passed into it, whlie `useRef()` doesn't.
This means that we can call `prism.ref()` in any order, and we can call it multiple times with the same key.

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key for the ref. Should be unique inside of the prism. |
| `initialValue` | `T` | The initial value for the ref. |

##### Returns

`IRef`<`T`\>

`{current: V}` - The ref object.

Note that the ref object will always return its initial value if the prism is cold. It'll only record
its current value if the prism is hot (and will forget again if the prism goes cold again).

**`Example`**

```ts
const pr = prism(() => {
  const ref1 = prism.ref("ref1", 0)
  console.log(ref1.current) // will print 0, and if the prism is hot, it'll print the current value
  ref1.current++ // changing the current value of the ref
})
```

#### Defined in

[prism/prism.ts:884](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L884)

___

### scope

• **scope**: <T\>(`key`: `string`, `fn`: () => `T`) => `T`

#### Type declaration

▸ <`T`\>(`key`, `fn`): `T`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `fn` | () => `T` |

##### Returns

`T`

#### Defined in

[prism/prism.ts:889](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L889)

___

### source

• **source**: <V\>(`subscribe`: (`fn`: (`val`: `V`) => `void`) => `VoidFn`, `getValue`: () => `V`) => `V`

#### Type declaration

▸ <`V`\>(`subscribe`, `getValue`): `V`

`prism.source()`  allow a prism to react to changes in some external source (other than other prisms).
For example, `Atom.pointerToPrism()` uses `prism.source()` to create a prism that reacts to changes in the atom's value.

##### Type parameters

| Name |
| :------ |
| `V` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscribe` | (`fn`: (`val`: `V`) => `void`) => `VoidFn` | The prism will call this function as soon as the prism goes hot. This function should return an unsubscribe function function which the prism will call when it goes cold. |
| `getValue` | () => `V` | A function that returns the current value of the external source. |

##### Returns

`V`

The current value of the source

Example:
```ts
function prismFromInputElement(input: HTMLInputElement): Prism<string> {
  function listen(cb: (value: string) => void) {
    const listener = () => {
      cb(input.value)
    }
    input.addEventListener('input', listener)
    return () => {
      input.removeEventListener('input', listener)
    }
  }
  
  function get() {
    return input.value
  }
  return prism(() => prism.source(listen, get))
}
```

#### Defined in

[prism/prism.ts:892](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L892)

___

### state

• **state**: <T\>(`key`: `string`, `initialValue`: `T`) => [`T`, (`val`: `T`) => `void`]

#### Type declaration

▸ <`T`\>(`key`, `initialValue`): [`T`, (`val`: `T`) => `void`]

A state hook, similar to react's `useState()`.

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | the key for the state |
| `initialValue` | `T` | the initial value |

##### Returns

[`T`, (`val`: `T`) => `void`]

[currentState, setState]

**`Example`**

```ts
import {prism} from 'dataverse'

// This prism holds the current mouse position and updates when the mouse moves
const mousePositionD = prism(() => {
  const [pos, setPos] = prism.state<[x: number, y: number]>('pos', [0, 0])

  prism.effect(
    'setupListeners',
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        setPos([e.screenX, e.screenY])
      }
      document.addEventListener('mousemove', handleMouseMove)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [],
  )

  return pos
})
```

#### Defined in

[prism/prism.ts:888](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L888)

___

### sub

• **sub**: <T\>(`key`: `string`, `fn`: () => `T`, `deps`: `undefined` \| `any`[]) => `T`

#### Type declaration

▸ <`T`\>(`key`, `fn`, `deps`): `T`

Just an alias for `prism.memo(key, () => prism(fn), deps).getValue()`. It creates a new prism, memoizes it, and returns the value.
`prism.sub()` is useful when you want to divide your prism into smaller prisms, each of which
would _only_ recalculate when _certain_ dependencies change. In other words, it's an optimization tool.

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key for the memo. Should be unique inside of the prism |
| `fn` | () => `T` | The function to run inside the prism |
| `deps` | `undefined` \| `any`[] | The dependency array. Provide `[]` if you want to the value to be memoized only once and never re-calculated. |

##### Returns

`T`

The value of the inner prism

#### Defined in

[prism/prism.ts:890](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/prism/prism.ts#L890)
