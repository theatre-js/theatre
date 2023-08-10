[@theatre/dataverse](../README.md) / PointerProxy

# Class: PointerProxy<O\>

Allows creating pointer-prisms where the pointer can be switched out.

**`Remarks`**

This allows reacting not just to value changes at a certain pointer, but changes
to the proxied pointer too.

## Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `Object` |

## Implements

- [`PointerToPrismProvider`](../interfaces/PointerToPrismProvider.md)

## Table of contents

### Constructors

- [constructor](PointerProxy.md#constructor)

### Properties

- [\_currentPointerBox](PointerProxy.md#_currentpointerbox)
- [pointer](PointerProxy.md#pointer)

### Methods

- [pointerToPrism](PointerProxy.md#pointertoprism)
- [setPointer](PointerProxy.md#setpointer)

## Constructors

### constructor

• **new PointerProxy**<`O`\>(`currentPointer`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `currentPointer` | [`Pointer`](../README.md#pointer)<`O`\> |

#### Defined in

[PointerProxy.ts:34](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/PointerProxy.ts#L34)

## Properties

### \_currentPointerBox

• `Private` `Readonly` **\_currentPointerBox**: [`Atom`](Atom.md)<[`Pointer`](../README.md#pointer)<`O`\>\>

#### Defined in

[PointerProxy.ts:25](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/PointerProxy.ts#L25)

___

### pointer

• `Readonly` **pointer**: [`Pointer`](../README.md#pointer)<`O`\>

Convenience pointer pointing to the root of this PointerProxy.

**`Remarks`**

Allows convenient use of [pointerToPrism](PointerProxy.md#pointertoprism) and [val](../README.md#val).

#### Defined in

[PointerProxy.ts:32](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/PointerProxy.ts#L32)

## Methods

### pointerToPrism

▸ **pointerToPrism**<`P`\>(`pointer`): [`Prism`](../interfaces/Prism-1.md)<`P`\>

Returns a prism of the value at the provided sub-path of the proxied pointer.

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `pointer` | [`Pointer`](../README.md#pointer)<`P`\> |

#### Returns

[`Prism`](../interfaces/Prism-1.md)<`P`\>

#### Implementation of

[PointerToPrismProvider](../interfaces/PointerToPrismProvider.md).[pointerToPrism](../interfaces/PointerToPrismProvider.md#pointertoprism)

#### Defined in

[PointerProxy.ts:52](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/PointerProxy.ts#L52)

___

### setPointer

▸ **setPointer**(`p`): `void`

Sets the underlying pointer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`Pointer`](../README.md#pointer)<`O`\> | The pointer to be proxied. |

#### Returns

`void`

#### Defined in

[PointerProxy.ts:43](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/PointerProxy.ts#L43)
