[@theatre/dataverse](../README.md) / Atom

# Class: Atom<State\>

Wraps an object whose (sub)properties can be individually tracked.

## Type parameters

| Name |
| :------ |
| `State` |

## Implements

- [`PointerToPrismProvider`](../interfaces/PointerToPrismProvider.md)

## Table of contents

### Constructors

- [constructor](Atom.md#constructor)

### Properties

- [pointer](Atom.md#pointer)
- [prism](Atom.md#prism)

### Methods

- [get](Atom.md#get)
- [getByPointer](Atom.md#getbypointer)
- [onChange](Atom.md#onchange)
- [onChangeByPointer](Atom.md#onchangebypointer)
- [pointerToPrism](Atom.md#pointertoprism)
- [reduce](Atom.md#reduce)
- [reduceByPointer](Atom.md#reducebypointer)
- [set](Atom.md#set)
- [setByPointer](Atom.md#setbypointer)

## Constructors

### constructor

• **new Atom**<`State`\>(`initialState`)

#### Type parameters

| Name |
| :------ |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `initialState` | `State` |

#### Defined in

[Atom.ts:119](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L119)

## Properties

### pointer

• `Readonly` **pointer**: [`Pointer`](../README.md#pointer)<`State`\>

Convenience property that gives you a pointer to the root of the atom.

#### Defined in

[Atom.ts:113](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L113)

___

### prism

• `Readonly` **prism**: [`Prism`](../interfaces/Prism-1.md)<`State`\>

#### Defined in

[Atom.ts:115](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L115)

## Methods

### get

▸ **get**(): `State`

Returns the current state of the atom.

#### Returns

`State`

#### Defined in

[Atom.ts:139](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L139)

___

### getByPointer

▸ **getByPointer**<`S`\>(`pointerOrFn`): `S`

Returns the value at the given pointer

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointerOrFn` | [`Pointer`](../README.md#pointer)<`S`\> \| (`p`: [`Pointer`](../README.md#pointer)<`State`\>) => [`Pointer`](../README.md#pointer)<`S`\> | A pointer to the desired path. Could also be a function returning a pointer Example ```ts const atom = atom({ a: { b: 1 } }) atom.getByPointer(atom.pointer.a.b) // 1 atom.getByPointer((p) => p.a.b) // 1 ``` |

#### Returns

`S`

#### Defined in

[Atom.ts:155](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L155)

___

### onChange

▸ **onChange**(`cb`): () => `void`

Adds a listener that will be called whenever the state of the atom changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cb` | (`v`: `State`) => `void` | The callback to call when the value changes |

#### Returns

`fn`

A function that can be called to unsubscribe from the listener

**NOTE** Unlike [prism](../README.md#prism)s, `onChangeByPointer` and `onChange()` are traditional event listeners. They don't
provide any of the benefits of prisms. They don't compose, they can't be coordinated via a Ticker, their derivations
aren't cached, etc. You're almost always better off using a prism (which will internally use `onChangeByPointer`).

```ts
const a = atom({foo: 1})
const unsubscribe = a.onChange((v) => {
console.log('a changed to', v)
})
a.set({foo: 3}) // logs 'a changed to {foo: 3}'
unsubscribe()
```

▸ (): `void`

Adds a listener that will be called whenever the state of the atom changes.

##### Returns

`void`

A function that can be called to unsubscribe from the listener

**NOTE** Unlike [prism](../README.md#prism)s, `onChangeByPointer` and `onChange()` are traditional event listeners. They don't
provide any of the benefits of prisms. They don't compose, they can't be coordinated via a Ticker, their derivations
aren't cached, etc. You're almost always better off using a prism (which will internally use `onChangeByPointer`).

```ts
const a = atom({foo: 1})
const unsubscribe = a.onChange((v) => {
console.log('a changed to', v)
})
a.set({foo: 3}) // logs 'a changed to {foo: 3}'
unsubscribe()
```

#### Defined in

[Atom.ts:305](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L305)

___

### onChangeByPointer

▸ **onChangeByPointer**<`S`\>(`pointerOrFn`, `cb`): () => `void`

Adds a listener that will be called whenever the value at the given pointer changes.

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointerOrFn` | [`Pointer`](../README.md#pointer)<`S`\> \| (`p`: [`Pointer`](../README.md#pointer)<`State`\>) => [`Pointer`](../README.md#pointer)<`S`\> | - |
| `cb` | (`v`: `S`) => `void` | The callback to call when the value changes |

#### Returns

`fn`

A function that can be called to unsubscribe from the listener

**NOTE** Unlike [prism](../README.md#prism)s, `onChangeByPointer` and `onChange()` are traditional event listeners. They don't
provide any of the benefits of prisms. They don't compose, they can't be coordinated via a Ticker, their derivations
aren't cached, etc. You're almost always better off using a prism (which will internally use `onChangeByPointer`).

```ts
const a = atom({foo: 1})
const unsubscribe = a.onChangeByPointer(a.pointer.foo, (v) => {
 console.log('foo changed to', v)
})
a.setByPointer(a.pointer.foo, 2) // logs 'foo changed to 2'
a.set({foo: 3}) // logs 'foo changed to 3'
unsubscribe()
```

▸ (): `void`

##### Returns

`void`

#### Defined in

[Atom.ts:271](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L271)

___

### pointerToPrism

▸ **pointerToPrism**<`P`\>(`pointer`): [`Prism`](../interfaces/Prism-1.md)<`P`\>

Returns a new prism of the value at the provided path.

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointer` | [`Pointer`](../README.md#pointer)<`P`\> | The path to create the prism at. ```ts const pr = atom({ a: { b: 1 } }).pointerToPrism(atom.pointer.a.b) pr.getValue() // 1 ``` |

#### Returns

[`Prism`](../interfaces/Prism-1.md)<`P`\>

#### Implementation of

[PointerToPrismProvider](../interfaces/PointerToPrismProvider.md).[pointerToPrism](../interfaces/PointerToPrismProvider.md#pointertoprism)

#### Defined in

[Atom.ts:319](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L319)

___

### reduce

▸ **reduce**(`fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`state`: `State`) => `State` |

#### Returns

`void`

#### Defined in

[Atom.ts:173](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L173)

___

### reduceByPointer

▸ **reduceByPointer**<`S`\>(`pointerOrFn`, `reducer`): `void`

Reduces the value at the given pointer

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointerOrFn` | [`Pointer`](../README.md#pointer)<`S`\> \| (`p`: [`Pointer`](../README.md#pointer)<`State`\>) => [`Pointer`](../README.md#pointer)<`S`\> | A pointer to the desired path. Could also be a function returning a pointer Example ```ts const atom = atom({ a: { b: 1 } }) atom.reduceByPointer(atom.pointer.a.b, (b) => b + 1) // atom.get().a.b === 2 atom.reduceByPointer((p) => p.a.b, (b) => b + 1) // atom.get().a.b === 2 ``` |
| `reducer` | (`s`: `S`) => `S` | - |

#### Returns

`void`

#### Defined in

[Atom.ts:189](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L189)

___

### set

▸ **set**(`newState`): `void`

Sets the state of the atom.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newState` | `State` | The new state of the atom. |

#### Returns

`void`

#### Defined in

[Atom.ts:129](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L129)

___

### setByPointer

▸ **setByPointer**<`S`\>(`pointerOrFn`, `val`): `void`

Sets the value at the given pointer

#### Type parameters

| Name |
| :------ |
| `S` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointerOrFn` | [`Pointer`](../README.md#pointer)<`S`\> \| (`p`: [`Pointer`](../README.md#pointer)<`State`\>) => [`Pointer`](../README.md#pointer)<`S`\> | A pointer to the desired path. Could also be a function returning a pointer Example ```ts const atom = atom({ a: { b: 1 } }) atom.setByPointer(atom.pointer.a.b, 2) // atom.get().a.b === 2 atom.setByPointer((p) => p.a.b, 2) // atom.get().a.b === 2 ``` |
| `val` | `S` | - |

#### Returns

`void`

#### Defined in

[Atom.ts:214](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Atom.ts#L214)
