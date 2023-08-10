[@theatre/dataverse](../README.md) / PointerToPrismProvider

# Interface: PointerToPrismProvider

Interface for objects that can provide a prism at a certain path.

## Implemented by

- [`Atom`](../classes/Atom.md)
- [`PointerProxy`](../classes/PointerProxy.md)

## Table of contents

### Methods

- [pointerToPrism](PointerToPrismProvider.md#pointertoprism)

## Methods

### pointerToPrism

▸ **pointerToPrism**<`P`\>(`pointer`): [`Prism`](Prism-1.md)<`P`\>

Returns a prism of the value at the provided pointer.

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `pointer` | [`Pointer`](../README.md#pointer)<`P`\> |

#### Returns

[`Prism`](Prism-1.md)<`P`\>

#### Defined in

[pointerToPrism.ts:21](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/pointerToPrism.ts#L21)
