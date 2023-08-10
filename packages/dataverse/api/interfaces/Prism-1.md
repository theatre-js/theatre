[@theatre/dataverse](../README.md) / Prism

# Interface: Prism<V\>

Common interface for prisms.

## Type parameters

| Name |
| :------ |
| `V` |

## Table of contents

### Properties

- [isHot](Prism-1.md#ishot)
- [isPrism](Prism-1.md#isprism)

### Methods

- [getValue](Prism-1.md#getvalue)
- [keepHot](Prism-1.md#keephot)
- [onChange](Prism-1.md#onchange)
- [onStale](Prism-1.md#onstale)

## Properties

### isHot

• **isHot**: `boolean`

Whether the prism is hot.

#### Defined in

[prism/Interface.ts:18](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L18)

___

### isPrism

• **isPrism**: ``true``

Whether the object is a prism.

#### Defined in

[prism/Interface.ts:13](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L13)

## Methods

### getValue

▸ **getValue**(): `V`

Gets the current value of the prism. If the value is stale, it causes the prism to freshen.

#### Returns

`V`

#### Defined in

[prism/Interface.ts:60](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L60)

___

### keepHot

▸ **keepHot**(): `VoidFn`

Keep the prism hot, even if there are no tappers (subscribers).

#### Returns

`VoidFn`

#### Defined in

[prism/Interface.ts:34](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L34)

___

### onChange

▸ **onChange**(`ticker`, `listener`, `immediate?`): `VoidFn`

Calls `listener` with a fresh value every time the prism _has_ a new value, throttled by Ticker.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ticker` | [`Ticker`](../classes/Ticker.md) |
| `listener` | (`v`: `V`) => `void` |
| `immediate?` | `boolean` |

#### Returns

`VoidFn`

#### Defined in

[prism/Interface.ts:23](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L23)

___

### onStale

▸ **onStale**(`cb`): `VoidFn`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cb` | () => `void` |

#### Returns

`VoidFn`

#### Defined in

[prism/Interface.ts:29](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/prism/Interface.ts#L29)
