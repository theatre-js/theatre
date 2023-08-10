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

- [\_currentState](Atom.md#_currentstate)
- [\_rootScope](Atom.md#_rootscope)
- [pointer](Atom.md#pointer)
- [prism](Atom.md#prism)

### Methods

- [\_checkUpdates](Atom.md#_checkupdates)
- [\_getIn](Atom.md#_getin)
- [\_getOrCreateScopeForPath](Atom.md#_getorcreatescopeforpath)
- [\_onPointerValueChange](Atom.md#_onpointervaluechange)
- [get](Atom.md#get)
- [getByPointer](Atom.md#getbypointer)
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

[Atom.ts:119](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L119)

## Properties

### \_currentState

• `Private` **\_currentState**: `State`

#### Defined in

[Atom.ts:101](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L101)

___

### \_rootScope

• `Private` `Readonly` **\_rootScope**: `Scope`

#### Defined in

[Atom.ts:106](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L106)

___

### pointer

• `Readonly` **pointer**: [`Pointer`](../README.md#pointer)<`State`\>

Convenience property that gives you a pointer to the root of the atom.

**`Remarks`**

Equivalent to `pointer({ root: thisAtom, path: [] })`.

#### Defined in

[Atom.ts:113](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L113)

___

### prism

• `Readonly` **prism**: [`Prism`](../interfaces/Prism-1.md)<`State`\>

#### Defined in

[Atom.ts:115](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L115)

## Methods

### \_checkUpdates

▸ `Private` **_checkUpdates**(`scope`, `oldState`, `newState`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | `Scope` |
| `oldState` | `unknown` |
| `newState` | `unknown` |

#### Returns

`void`

#### Defined in

[Atom.ts:218](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L218)

___

### \_getIn

▸ `Private` **_getIn**(`path`): `unknown`

Gets the state of the atom at `path`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | (`string` \| `number`)[] |

#### Returns

`unknown`

#### Defined in

[Atom.ts:166](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L166)

___

### \_getOrCreateScopeForPath

▸ `Private` **_getOrCreateScopeForPath**(`path`): `Scope`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | (`string` \| `number`)[] |

#### Returns

`Scope`

#### Defined in

[Atom.ts:240](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L240)

___

### \_onPointerValueChange

▸ `Private` **_onPointerValueChange**<`P`\>(`pointer`, `cb`): () => `void`

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `pointer` | [`Pointer`](../README.md#pointer)<`P`\> |
| `cb` | (`v`: `P`) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[Atom.ts:248](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L248)

___

### get

▸ **get**(): `State`

#### Returns

`State`

#### Defined in

[Atom.ts:136](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L136)

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

[Atom.ts:152](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L152)

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

[Atom.ts:271](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L271)

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

[Atom.ts:170](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L170)

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

[Atom.ts:186](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L186)

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

[Atom.ts:129](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L129)

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

[Atom.ts:211](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Atom.ts#L211)
