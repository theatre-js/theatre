[@theatre/dataverse](../README.md) / Ticker

# Class: Ticker

The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
external scheduling strategy, e.g. a raf.

## Table of contents

### Constructors

- [constructor](Ticker.md#constructor)

### Properties

- [\_\_ticks](Ticker.md#__ticks)

### Accessors

- [dormant](Ticker.md#dormant)
- [time](Ticker.md#time)

### Methods

- [offNextTick](Ticker.md#offnexttick)
- [offThisOrNextTick](Ticker.md#offthisornexttick)
- [onNextTick](Ticker.md#onnexttick)
- [onThisOrNextTick](Ticker.md#onthisornexttick)
- [tick](Ticker.md#tick)

## Constructors

### constructor

• **new Ticker**(`_conf?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_conf?` | `Object` |
| `_conf.onActive?` | () => `void` |
| `_conf.onDormant?` | () => `void` |

#### Defined in

[Ticker.ts:43](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L43)

## Properties

### \_\_ticks

• **\_\_ticks**: `number` = `0`

Counts up for every tick executed.
Internally, this is used to measure ticks per second.

This is "public" to TypeScript, because it's a tool for performance measurements.
Consider this as experimental, and do not rely on it always being here in future releases.

#### Defined in

[Ticker.ts:41](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L41)

## Accessors

### dormant

• `get` **dormant**(): `boolean`

Whether the Ticker is dormant

#### Returns

`boolean`

#### Defined in

[Ticker.ts:31](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L31)

___

### time

• `get` **time**(): `number`

The time at the start of the current tick if there is a tick in progress, otherwise defaults to
`performance.now()`.

#### Returns

`number`

#### Defined in

[Ticker.ts:122](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L122)

## Methods

### offNextTick

▸ **offNextTick**(`fn`): `void`

De-registers a fn to be called on the next tick.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `ICallback` | The function to be de-registered. |

#### Returns

`void`

**`See`**

onNextTick

#### Defined in

[Ticker.ts:114](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L114)

___

### offThisOrNextTick

▸ **offThisOrNextTick**(`fn`): `void`

De-registers a fn to be called either on this tick or the next tick.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `ICallback` | The function to be de-registered. |

#### Returns

`void`

**`See`**

onThisOrNextTick

#### Defined in

[Ticker.ts:103](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L103)

___

### onNextTick

▸ **onNextTick**(`fn`): `void`

Registers a side effect to be called on the next tick.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `ICallback` | The function to be registered. |

#### Returns

`void`

**`See`**

 - onThisOrNextTick
 - offNextTick

#### Defined in

[Ticker.ts:89](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L89)

___

### onThisOrNextTick

▸ **onThisOrNextTick**(`fn`): `void`

Registers for fn to be called either on this tick or the next tick.

If `onThisOrNextTick()` is called while `Ticker.tick()` is running, the
side effect _will_ be called within the running tick. If you don't want this
behavior, you can use `onNextTick()`.

Note that `fn` will be added to a `Set()`. Which means, if you call `onThisOrNextTick(fn)`
with the same fn twice in a single tick, it'll only run once.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `ICallback` | The function to be registered. |

#### Returns

`void`

**`See`**

offThisOrNextTick

#### Defined in

[Ticker.ts:74](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L74)

___

### tick

▸ **tick**(`t?`): `void`

Triggers a tick which starts executing the callbacks scheduled for this tick.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `t` | `number` | The time at the tick. |

#### Returns

`void`

**`See`**

 - onThisOrNextTick
 - onNextTick

#### Defined in

[Ticker.ts:149](https://github.com/theatre-js/theatre/blob/main/packages/dataverse/src/Ticker.ts#L149)
