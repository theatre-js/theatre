[@theatre/dataverse](../README.md) / Ticker

# Class: Ticker

The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
external scheduling strategy, e.g. a raf.

## Table of contents

### Constructors

- [constructor](Ticker.md#constructor)

### Properties

- [\_\_ticks](Ticker.md#__ticks)
- [\_conf](Ticker.md#_conf)
- [\_dormant](Ticker.md#_dormant)
- [\_numberOfDormantTicks](Ticker.md#_numberofdormantticks)
- [\_scheduledForNextTick](Ticker.md#_scheduledfornexttick)
- [\_scheduledForThisOrNextTick](Ticker.md#_scheduledforthisornexttick)
- [\_ticking](Ticker.md#_ticking)
- [\_timeAtCurrentTick](Ticker.md#_timeatcurrenttick)

### Accessors

- [dormant](Ticker.md#dormant)
- [time](Ticker.md#time)

### Methods

- [\_goActive](Ticker.md#_goactive)
- [\_goDormant](Ticker.md#_godormant)
- [\_tick](Ticker.md#_tick)
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

[Ticker.ts:43](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L43)

## Properties

### \_\_ticks

• **\_\_ticks**: `number` = `0`

Counts up for every tick executed.
Internally, this is used to measure ticks per second.

This is "public" to TypeScript, because it's a tool for performance measurements.
Consider this as experimental, and do not rely on it always being here in future releases.

#### Defined in

[Ticker.ts:41](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L41)

___

### \_conf

• `Private` `Optional` **\_conf**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `onActive?` | () => `void` |
| `onDormant?` | () => `void` |

#### Defined in

[Ticker.ts:44](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L44)

___

### \_dormant

• `Private` **\_dormant**: `boolean` = `true`

Whether the Ticker is dormant

#### Defined in

[Ticker.ts:24](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L24)

___

### \_numberOfDormantTicks

• `Private` **\_numberOfDormantTicks**: `number` = `0`

#### Defined in

[Ticker.ts:26](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L26)

___

### \_scheduledForNextTick

• `Private` **\_scheduledForNextTick**: `Set`<`ICallback`\>

#### Defined in

[Ticker.ts:17](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L17)

___

### \_scheduledForThisOrNextTick

• `Private` **\_scheduledForThisOrNextTick**: `Set`<`ICallback`\>

#### Defined in

[Ticker.ts:16](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L16)

___

### \_ticking

• `Private` **\_ticking**: `boolean` = `false`

#### Defined in

[Ticker.ts:19](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L19)

___

### \_timeAtCurrentTick

• `Private` **\_timeAtCurrentTick**: `number`

#### Defined in

[Ticker.ts:18](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L18)

## Accessors

### dormant

• `get` **dormant**(): `boolean`

Whether the Ticker is dormant

#### Returns

`boolean`

#### Defined in

[Ticker.ts:31](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L31)

___

### time

• `get` **time**(): `number`

The time at the start of the current tick if there is a tick in progress, otherwise defaults to
`performance.now()`.

#### Returns

`number`

#### Defined in

[Ticker.ts:122](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L122)

## Methods

### \_goActive

▸ `Private` **_goActive**(): `void`

#### Returns

`void`

#### Defined in

[Ticker.ts:128](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L128)

___

### \_goDormant

▸ `Private` **_goDormant**(): `void`

#### Returns

`void`

#### Defined in

[Ticker.ts:134](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L134)

___

### \_tick

▸ `Private` **_tick**(`iterationNumber`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `iterationNumber` | `number` |

#### Returns

`void`

#### Defined in

[Ticker.ts:184](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L184)

___

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

[Ticker.ts:114](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L114)

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

[Ticker.ts:103](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L103)

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

[Ticker.ts:89](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L89)

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

[Ticker.ts:74](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L74)

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

[Ticker.ts:149](https://github.com/theatre-js/theatre/blob/327b859ed/packages/dataverse/src/Ticker.ts#L149)
