import type {Pointer} from '@theatre/dataverse'
import type {OnDiskState} from '@theatre/core/types/private/core'

/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

/** temporary any type until we move all of studio's types to core */
export type $____FixmeStudio = any

/**
 * This is equivalent to `Partial<Record<Key, V>>` being used to describe a sort of Map
 * where the keys might not have values.
 *
 * We do not use `Map`s or `Set`s, because they add complexity with converting to
 * `JSON.stringify` + pointer types.
 */
export type StrictRecord<Key extends string, V> = {[K in Key]?: V}

export type IRange = IPlaybackRange

/**
 * Using a symbol, we can sort of add unique properties to arbitrary other types.
 * So, we use this to our advantage to add a "marker" of information to strings using
 * the {@link Nominal} type.
 *
 * Can be used with keys in pointers.
 * This identifier shows in the expanded {@link Nominal} as `string & {[nominal]:"SequenceTrackId"}`,
 * So, we're opting to keeping the identifier short.
 */
const nominal = Symbol()

/**
 * This creates an "opaque"/"nominal" type.
 *
 * Our primary use case is to be able to use with keys in pointers.
 *
 * Numbers cannot be added together if they are "nominal"
 *
 * See {@link nominal} for more details.
 */
type Nominal<N extends string> = string & {[nominal]: N}

/**
 * Represents the `x` or `y` value of getBoundingClientRect().
 * In other words, represents a distance from 0,0 in screen space.
 */
export type PositionInScreenSpace = number

export type VoidFn = () => void

export type Asset = {type: 'image'; id: string | undefined}
export type File = {type: 'file'; id: string | undefined}

/**
 * A `SerializableMap` is a plain JS object that can be safely serialized to JSON.
 */
export type SerializableMap<
  Primitives extends SerializablePrimitive = SerializablePrimitive,
> = {[Key in string]?: SerializableValue<Primitives>}

/*
 * TODO: For now the rgba primitive type is hard-coded. We should make it proper.
 * What instead we should do is somehow exclude objects where
 * object.type !== 'compound'. One way to do this would be
 *
 * type SerializablePrimitive<T> = T extends {type: 'compound'} ? never : T;
 *
 * const badStuff = {
 *   type: 'compound',
 *   foo: 3,
 * } as const
 *
 * const goodStuff = {
 *   type: 'literallyanythingelse',
 *   foo: 3,
 * } as const
 *
 * function serializeStuff<T>(giveMeStuff: SerializablePrimitive<T>) {
 *   // ...
 * }
 *
 * serializeStuff(badStuff)
 * serializeStuff(goodStuff)
 *
 * However this wouldn't protect against other unserializable stuff, or nested
 * unserializable stuff, since using mapped types seem to break it for some reason.
 *
 * TODO: Consider renaming to `SerializableSimple` if this should be aligned with "simple props".
 */
export type SerializablePrimitive =
  | string
  | number
  | boolean
  | {r: number; g: number; b: number; a: number}
  | Asset

/**
 * This type represents all values that can be safely serialized.
 * Also, it's notable that this type is compatible for dataverse pointer traversal (everything
 * is path accessible [e.g. `a.b.c`]).
 *
 * One example usage is for keyframe values or static overrides such as `Rgba`, `string`, `number`, and "compound values".
 */
export type SerializableValue<
  Primitives extends SerializablePrimitive = SerializablePrimitive,
> = Primitives | SerializableMap

export type DeepPartialOfSerializableValue<T extends SerializableValue> =
  T extends SerializableMap
    ? {
        [K in keyof T]?: DeepPartialOfSerializableValue<
          Exclude<T[K], undefined>
        >
      }
    : T

export type KeyframeId = Nominal<'KeyframeId'>
export type SequenceTrackId = Nominal<'SequenceTrackId'>
export type ObjectAddressKey = Nominal<'ObjectAddressKey'>
export type ProjectId = Nominal<'ProjectId'>
export type SheetId = Nominal<'SheetId'>
export type SheetInstanceId = Nominal<'SheetInstanceId'>
export type PaneInstanceId = Nominal<'PaneInstanceId'>
export type SequenceMarkerId = Nominal<'SequenceMarkerId'>

/**
 * NOTE: **INTERNAL and UNSTABLE** - This _WILL_ break between minor versions.
 *
 * This type represents the object returned by `studio.createContnentOfSaveFile()`. It's
 * meant for advanced users who want to interact with the state of projects. In the vast
 * majority of cases, you __should not__ use this type. Either an API for your use-case
 * already exists, or you should open an issue on GitHub: https://github.com/theatre-js/theatre/issues
 *
 */
export type __UNSTABLE_Project_OnDiskState = OnDiskState

import type {PathToProp} from '@theatre/utils/pathToProp'

/**
 * Addresses are used to identify projects, sheets, objects, and other things.
 *
 * For example, a project's address looks like `{projectId: 'my-project'}`, and a sheet's
 * address looks like `{projectId: 'my-project', sheetId: 'my-sheet'}`.
 *
 * As you see, a Sheet's address is a superset of a Project's address. This is so that we can
 * use the same address type for both. All addresses follow the same rule. An object's address
 * extends its sheet's address, which extends its project's address.
 *
 * For example, generating an object's address from a sheet's address is as simple as `{...sheetAddress, objectId: 'my-object'}`.
 *
 * Also, if you need the projectAddress of an object, you can just re-use the object's address:
 * `aFunctionThatRequiresProjectAddress(objectAddress)`.
 */

/**
 * Represents the address to a project
 */
export interface ProjectAddress {
  projectId: ProjectId
}

/**
 * Represents the address to a specific instance of a Sheet
 *
 * @example
 * ```ts
 * const sheet = project.sheet('a sheet', 'some instance id')
 * sheet.address.sheetId === 'a sheet'
 * sheet.address.sheetInstanceId === 'sheetInstanceId'
 * ```
 *
 * See {@link WithoutSheetInstance} for a type that doesn't include the sheet instance id.
 */
export interface SheetAddress extends ProjectAddress {
  sheetId: SheetId
  sheetInstanceId: SheetInstanceId
}

/**
 * Removes `sheetInstanceId` from an address, making it refer to
 * all instances of a certain `sheetId`.
 *
 * See {@link SheetAddress} for a type that includes the sheet instance id.
 */
export type WithoutSheetInstance<T extends SheetAddress> = Omit<
  T,
  'sheetInstanceId'
>

export type SheetInstanceOptional<T extends SheetAddress> =
  WithoutSheetInstance<T> & {sheetInstanceId?: SheetInstanceId | undefined}

/**
 * Represents the address to a Sheet's Object.
 *
 * It includes the sheetInstance, so it's specific to a single instance of a sheet. If you
 * would like an address that doesn't include the sheetInstance, use `WithoutSheetInstance<SheetObjectAddress>`.
 */
export interface SheetObjectAddress extends SheetAddress {
  /**
   * The key of the object.
   *
   * @example
   * ```ts
   * const obj = sheet.object('foo', {})
   * obj.address.objectKey === 'foo'
   * ```
   */
  objectKey: ObjectAddressKey
}

/**
 * Represents the path to a certain prop of an object
 */
export interface PropAddress extends SheetObjectAddress {
  pathToProp: PathToProp
}

/**
 * Represents the address of a certain sequence of a sheet.
 *
 * Since currently sheets are single-sequence only, `sequenceName` is always `'default'` for now.
 */
export interface SequenceAddress extends SheetAddress {
  sequenceName: string
}

/**
 * A project's config object (currently the only point of configuration is the project's state)
 */

export type IProjectConfig = {
  /**
   * The state of the project, as [exported](https://www.theatrejs.com/docs/latest/manual/projects#state) by the studio.
   */
  state?: any // intentional
  assets?: {
    baseUrl?: string
  }
}
/**
 * A Theatre.js project
 */

export interface IProject {
  readonly type: 'Theatre_Project_PublicAPI'
  /**
   * If `@theatre/studio` is used, this promise would resolve when studio has loaded
   * the state of the project into memory.
   *
   * If `@theatre/studio` is not used, this promise is already resolved.
   */
  readonly ready: Promise<void>
  /**
   * Shows whether the project is ready to be used.
   * Better to use {@link IProject.ready}, which is a promise that would
   * resolve when the project is ready.
   */
  readonly isReady: boolean
  /**
   * The project's address
   */
  readonly address: ProjectAddress

  /**
   * Creates a Sheet under the project
   * @param sheetId - Sheets are identified by their `sheetId`, which must be a string longer than 3 characters
   * @param instanceId - Optionally provide an `instanceId` if you want to create multiple instances of the same Sheet
   * @returns The newly created Sheet
   *
   * **Docs: https://www.theatrejs.com/docs/latest/manual/sheets**
   */
  sheet(sheetId: string, instanceId?: string): ISheet

  /**
   * Returns the URL for an asset.
   *
   * @param asset - The asset to get the URL for
   * @returns The URL for the asset, or `undefined` if the asset is not found
   */
  getAssetUrl(asset: Asset | File): string | undefined
}

export interface ISheet {
  /**
   * All sheets have `sheet.type === 'Theatre_Sheet_PublicAPI'`
   */
  readonly type: 'Theatre_Sheet_PublicAPI'

  /**
   * The Project this Sheet belongs to
   */
  readonly project: IProject

  /**
   * The address of the Sheet
   */
  readonly address: SheetAddress

  /**
   * Creates a child object for the sheet
   *
   * **Docs: https://www.theatrejs.com/docs/latest/manual/objects**
   *
   * @param key - Each object is identified by a key, which is a non-empty string
   * @param props - The props of the object. See examples
   * @param options - (Optional) Provide `{reconfigure: true}` to reconfigure an existing object, or `{actions: { ... }}` to add custom buttons to the UI. Read the example below for details.
   *
   * @returns An Object
   *
   * @example
   * Usage:
   * ```ts
   * // Create an object named "a unique key" with no props
   * const obj = sheet.object("a unique key", {})
   * obj.address.objectKey // "a unique key"
   *
   *
   * // Create an object with {x: 0}
   * const obj = sheet.object("obj", {x: 0})
   * obj.value.x // returns 0 or the current number that the user has set
   *
   * // Create an object with nested props
   * const obj = sheet.object("obj", {position: {x: 0, y: 0}})
   * obj.value.position // {x: 0, y: 0}
   *
   * // you can also reconfigure an existing object:
   * const obj = sheet.object("obj", {foo: 0})
   * console.log(object.value.foo) // prints 0
   *
   * const obj2 = sheet.object("obj", {bar: 0}, {reconfigure: true})
   * console.log(object.value.foo) // prints undefined, since we've removed this prop via reconfiguring the object
   * console.log(object.value.bar) // prints 0, since we've introduced this prop by reconfiguring the object
   *
   * assert(obj === obj2) // passes, because reconfiguring the object returns the same object
   *
   * // you can add custom actions to an object:
   * const obj = sheet.object("obj", {foo: 0}, {
   *   actions: {
   *     // This will display a button in the UI that will reset the value of `foo` to 0
   *     Reset: () => {
   *       studio.transaction((api) => {
   *         api.set(obj.props.foo, 0)
   *       })
   *     }
   *   }
   * })
   * ```
   */
  object<Props extends UnknownShorthandCompoundProps>(
    key: string,
    props: Props,
    options?: {
      reconfigure?: boolean
      __actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION?: SheetObjectActionsConfig
    },
  ): ISheetObject<Props>

  /**
   * Detaches a previously created child object from the sheet.
   *
   * If you call `sheet.object(key)` again with the same `key`, the object's values of the object's
   * props WILL NOT be reset to their initial values.
   *
   * @param key - The `key` of the object previously given to `sheet.object(key, ...)`.
   */
  detachObject(key: string): void

  /**
   * The Sequence of this Sheet
   */
  readonly sequence: ISequence
}

export type SheetObjectPropTypeConfig =
  PropTypeConfig_Compound<UnknownValidCompoundProps>

export type SheetObjectAction = (object: ISheetObject) => void

export type SheetObjectActionsConfig = Record<string, SheetObjectAction>

export interface ISheetObject<
  Props extends UnknownShorthandCompoundProps = UnknownShorthandCompoundProps,
> {
  /**
   * All Objects will have `object.type === 'Theatre_SheetObject_PublicAPI'`
   */
  readonly type: 'Theatre_SheetObject_PublicAPI'

  /**
   * The current values of the props.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("obj", {x: 0})
   * console.log(obj.value.x) // prints 0 or the current numeric value
   * ```
   *
   * Future: Notice that if the user actually changes the Props config for one of the
   * properties, then this type can't be guaranteed accurrate.
   *  * Right now the user can't change prop configs, but we'll probably enable that
   *    functionality later via (`object.overrideConfig()`). We need to educate the
   *    user that they can't rely on static types to know the type of object.value.
   */
  readonly value: PropsValue<Props>

  /**
   * A Pointer to the props of the object.
   *
   * More documentation soon.
   */
  readonly props: Pointer<this['value']>

  /**
   * The instance of Sheet the Object belongs to
   */
  readonly sheet: ISheet

  /**
   * The Project the project belongs to
   */
  readonly project: IProject

  /**
   * An object representing the address of the Object
   */
  readonly address: SheetObjectAddress

  /**
   * Calls `fn` every time the value of the props change.
   *
   * @param fn - The callback is called every time the value of the props change, plus once at the beginning.
   * @param rafDriver - (optional) The `rafDriver` to use. Learn how to use `rafDriver`s [from the docs](https://www.theatrejs.com/docs/latest/manual/advanced#rafdrivers).
   * @returns an Unsubscribe function
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("Box", {position: {x: 0, y: 0}})
   * const div = document.getElementById("box")
   *
   * const unsubscribe = obj.onValuesChange((newValues) => {
   *   div.style.left = newValues.position.x + 'px'
   *   div.style.top = newValues.position.y + 'px'
   * })
   *
   * // you can call unsubscribe() to stop listening to changes
   * ```
   */
  onValuesChange(
    fn: (values: this['value']) => void,
    rafDriver?: IRafDriver,
  ): VoidFn

  /**
   * Sets the initial value of the object. This value overrides the default
   * values defined in the prop types, but would itself be overridden if the user
   * overrides it in the UI with a static or animated value.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("obj", {position: {x: 0, y: 0}})
   *
   * obj.value // {position: {x: 0, y: 0}}
   *
   * // here, we only override position.x
   * obj.initialValue = {position: {x: 2}}
   *
   * obj.value // {position: {x: 2, y: 0}}
   * ```
   */
  set initialValue(value: DeepPartialOfSerializableValue<this['value']>)
}

export interface IAttachAudioArgs {
  /**
   * Either a URL to the audio file (eg "http://localhost:3000/audio.mp3") or an instance of AudioBuffer
   */
  source: string | AudioBuffer
  /**
   * An optional AudioContext. If not provided, one will be created.
   */
  audioContext?: AudioContext
  /**
   * An AudioNode to feed the audio into. Will use audioContext.destination if not provided.
   */
  destinationNode?: AudioNode
}

export type KeyframeType = 'bezier' | 'hold'

export type BasicKeyframe = {
  id: KeyframeId
  /** The `value` is the raw value type such as `Rgba` or `number`. See {@link SerializableValue} */
  // Future: is there another layer that we may need to be able to store older values on the
  // case of a prop config change? As keyframes can technically have their propConfig changed.
  value: SerializableValue
  position: number
  handles: [leftX: number, leftY: number, rightX: number, rightY: number]
  connectedRight: boolean
  // defaults to 'bezier' to support project states made with theatre0.5.1 or earlier
  type?: KeyframeType
}

export interface ISequence {
  readonly type: 'Theatre_Sequence_PublicAPI'

  /**
   * Starts playback of a sequence.
   * Returns a promise that either resolves to true when the playback completes,
   * or resolves to false if playback gets interrupted (for example by calling sequence.pause())
   *
   * @returns A promise that resolves when the playback is finished, or rejects if interruped
   *
   * @example
   * Usage:
   * ```ts
   * // plays the sequence from the current position to sequence.length
   * sheet.sequence.play()
   *
   * // plays the sequence at 2.4x speed
   * sheet.sequence.play({rate: 2.4})
   *
   * // plays the sequence from second 1 to 4
   * sheet.sequence.play({range: [1, 4]})
   *
   * // plays the sequence 4 times
   * sheet.sequence.play({iterationCount: 4})
   *
   * // plays the sequence in reverse
   * sheet.sequence.play({direction: 'reverse'})
   *
   * // plays the sequence back and forth forever (until interrupted)
   * sheet.sequence.play({iterationCount: Infinity, direction: 'alternateReverse})
   *
   * // plays the sequence and logs "done" once playback is finished
   * sheet.sequence.play().then(() => console.log('done'))
   * ```
   */
  play(conf?: {
    /**
     * The number of times the animation must run. Must be an integer larger
     * than 0. Defaults to 1. Pick Infinity to run forever
     */
    iterationCount?: number
    /**
     * Limits the range to be played. Default is [0, sequence.length]
     */
    range?: IPlaybackRange
    /**
     * The playback rate. Defaults to 1. Choosing 2 would play the animation
     * at twice the speed.
     */
    rate?: number
    /**
     * The direction of the playback. Similar to CSS's animation-direction
     */
    direction?: IPlaybackDirection

    /**
     * Optionally provide a rafDriver to use for the playback. It'll default to
     * the core driver if not provided, which is a `requestAnimationFrame()` driver.
     * Learn how to use `rafDriver`s [from the docs](https://www.theatrejs.com/docs/latest/manual/advanced#rafdrivers).
     */
    rafDriver?: IRafDriver
  }): Promise<boolean>

  /**
   * Pauses the currently playing animation
   */
  pause(): void

  /**
   * The current position of the playhead.
   * In a time-based sequence, this represents the current time in seconds.
   */
  position: number

  /**
   * A Pointer to the sequence's inner state.
   *
   * @remarks
   * As with any Pointer, you can use this with {@link onChange | onChange()} to listen to its value changes
   * or with {@link val | val()} to read its current value.
   *
   * @example Usage
   * ```ts
   * import {onChange, val} from '@theatre/core'
   *
   * // let's assume `sheet` is a sheet
   * const sequence = sheet.sequence
   *
   * onChange(sequence.pointer.length, (len) => {
   *   console.log("Length of the sequence changed to:", len)
   * })
   *
   * onChange(sequence.pointer.position, (position) => {
   *   console.log("Position of the sequence changed to:", position)
   * })
   *
   * onChange(sequence.pointer.playing, (playing) => {
   *   console.log(playing ? 'playing' : 'paused')
   * })
   *
   * // we can also read the current value of the pointer
   * console.log('current length is', val(sequence.pointer.length))
   * ```
   */
  pointer: Pointer<{
    playing: boolean
    length: number
    position: number
  }>

  /**
   * Given a property, returns a list of keyframes that affect that property.
   *
   * @example
   * Usage:
   * ```ts
   * // let's assume `sheet` is a sheet and obj is one of its objects
   * const keyframes = sheet.sequence.__experimental_getKeyframes(obj.pointer.x)
   * console.log(keyframes) // an array of keyframes
   * ```
   */
  __experimental_getKeyframes(prop: Pointer<{}>): BasicKeyframe[]

  /**
   * Attaches an audio source to the sequence. Playing the sequence automatically
   * plays the audio source and their times are kept in sync.
   *
   * @returns A promise that resolves once the audio source is loaded and decoded
   *
   * Learn more [here](https://www.theatrejs.com/docs/latest/manual/audio).
   *
   * @example
   * Usage:
   * ```ts
   * // Loads and decodes audio from the URL and then attaches it to the sequence
   * await sheet.sequence.attachAudio({source: "http://localhost:3000/audio.mp3"})
   * sheet.sequence.play()
   *
   * // Providing your own AudioAPI Context, destination, etc
   * const audioContext: AudioContext = {...} // create an AudioContext using the Audio API
   * const audioBuffer: AudioBuffer = {...} // create an AudioBuffer
   * const destinationNode = audioContext.destination
   *
   * await sheet.sequence.attachAudio({source: audioBuffer, audioContext, destinationNode})
   * ```
   *
   * Note: It's better to provide the `audioContext` rather than allow Theatre.js to create it.
   * That's because some browsers [suspend the audioContext](https://developer.chrome.com/blog/autoplay/#webaudio)
   * unless it's initiated by a user gesture, like a click. If that happens, Theatre.js will
   * wait for a user gesture to resume the audioContext. But that's probably not an
   * optimal user experience. It is better to provide a button or some other UI element
   * to communicate to the user that they have to initiate the animation.
   *
   * @example
   * Example:
   * ```ts
   * // html: <button id="#start">start</button>
   * const button = document.getElementById('start')
   *
   * button.addEventListener('click', async () => {
   *   const audioContext = ...
   *   await sheet.sequence.attachAudio({audioContext, source: '...'})
   *   sheet.sequence.play()
   * })
   * ```
   */
  attachAudio(args: IAttachAudioArgs): Promise<{
    /**
     * An {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer | AudioBuffer}.
     * If `args.source` is a URL, then `decodedBuffer` would be the result
     * of {@link https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData | audioContext.decodeAudioData()}
     * on the audio file at that URL.
     *
     * If `args.source` is an `AudioBuffer`, then `decodedBuffer` would be equal to `args.source`
     */
    decodedBuffer: AudioBuffer
    /**
     * The `AudioContext`. It is either equal to `source.audioContext` if it is provided, or
     * one that's created on the fly.
     */
    audioContext: AudioContext
    /**
     * Equals to either `args.destinationNode`, or if none is provided, it equals `audioContext.destinationNode`.
     *
     * See `gainNode` for more info.
     */
    destinationNode: AudioNode

    /**
     * This is an intermediate GainNode that Theatre.js feeds its audio to. It is by default
     * connected to destinationNode, but you can disconnect the gainNode and feed it to your own graph.
     *
     * @example
     * For example:
     * ```ts
     * const {gainNode, audioContext} = await sequence.attachAudio({source: '/audio.mp3'})
     * // disconnect the gainNode (at this point, the sequence's audio track won't be audible)
     * gainNode.disconnect()
     * // create our own gain node
     * const lowerGain = audioContext.createGain()
     * // lower its volume to 10%
     * lowerGain.gain.setValueAtTime(0.1, audioContext.currentTime)
     * // feed the sequence's audio to our lowered gainNode
     * gainNode.connect(lowerGain)
     * // feed the lowered gainNode to the audioContext's destination
     * lowerGain.connect(audioContext.destination)
     * // now audio will be audible, with 10% the volume
     * ```
     */
    gainNode: GainNode
  }>
}

export type IPlaybackRange = [from: number, to: number]

export type IPlaybackDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternateReverse'

export interface IRafDriver {
  /**
   * All raf derivers have have `driver.type === 'Theatre_RafDriver_PublicAPI'`
   */
  readonly type: 'Theatre_RafDriver_PublicAPI'
  /**
   * The name of the driver. This is used for debugging purposes.
   */
  name: string
  /**
   * The id of the driver. This is used for debugging purposes.
   * It's guaranteed to be unique.
   */
  id: number
  /**
   * This is called by the driver when it's time to tick forward.
   * The time param is of the same type returned by `performance.now()`.
   */
  tick: (time: number) => void
}

/**
 * A linear interpolator for a certain value type.
 *
 * @param left - the value to interpolate from (beginning)
 * @param right - the value to interpolate to (end)
 * @param progression - the amount of progression. Starts at 0 and ends at 1. But could overshoot in either direction
 *
 * @example
 * ```ts
 * const numberInterpolator: Interpolator<number> = (left, right, progression) => left + progression * (right - left)
 *
 * numberInterpolator(-50, 50, 0.5) === 0
 * numberInterpolator(-50, 50, 0) === -50
 * numberInterpolator(-50, 50, 1) === 50
 * numberInterpolator(-50, 50, 2) === 150 // overshoot
 * ```
 */
export type Interpolator<T> = (left: T, right: T, progression: number) => T

export interface IBasePropType<
  LiteralIdentifier extends string,
  ValueType,
  DeserializeType = ValueType,
> {
  /**
   * Each prop config has a string literal identifying it. For example,
   * `assert.equal(t.number(10).type, 'number')`
   */
  type: LiteralIdentifier
  /**
   * the `valueType` is only used by typescript. It won't be present in runtime.
   */
  valueType: ValueType
  [propTypeSymbol]: 'TheatrePropType'
  /**
   * Each prop type may be given a custom label instead of the name of the sub-prop
   * it is in.
   *
   * @example
   * ```ts
   * const position = {
   *   x: t.number(0), // label would be 'x'
   *   y: t.number(0, {label: 'top'}) // label would be 'top'
   * }
   * ```
   */
  label: string | undefined
  default: ValueType
  /**
   * Each prop config has a `deserializeAndSanitize()` function that deserializes and sanitizes
   * any js value into one that is acceptable by this prop config, or `undefined`.
   *
   * As a rule, the value returned by this function should not hold any reference to `json` or any
   * other value referenced by the descendent props of `json`. This is to ensure that json values
   * controlled by the user can never change the values in the store. See `deserializeAndSanitize()` in
   * `t.compound()` or `t.rgba()` as examples.
   *
   * The `DeserializeType` is usually equal to `ValueType`. That is the case with
   * all simple prop configs, such as `number`, `string`, or `rgba`. However, composite
   * configs such as `compound` or `enum` may deserialize+sanitize into a partial value. For example,
   * a prop config of `t.compound({x: t.number(0), y: t.number(0)})` may deserialize+sanitize into `{x: 10}`.
   * This behavior is used by {@link SheetObject.getValues} to replace the missing sub-props
   * with their default value.
   *
   * Admittedly, this partial deserialization behavior is not what the word "deserialize"
   * typically implies in most codebases, so feel free to change this name into a more
   * appropriate one.
   *
   * Additionally, returning an `undefined` allows {@link SheetObject.getValues} to
   * replace the `undefined` with the default value of that prop.
   */
  deserializeAndSanitize: (json: unknown) => undefined | DeserializeType
}

interface ISimplePropType<LiteralIdentifier extends string, ValueType>
  extends IBasePropType<LiteralIdentifier, ValueType, ValueType> {
  interpolate: Interpolator<ValueType>
}

export interface PropTypeConfig_Number
  extends ISimplePropType<'number', number> {
  range?: [min: number, max: number]
  nudgeFn: NumberNudgeFn
  /**
   * See {@link defaultNumberNudgeFn} to see how `nudgeMultiplier` is treated.
   */
  nudgeMultiplier: number | undefined
}

export type NumberNudgeFn = (p: {
  deltaX: number
  deltaFraction: number
  magnitude: number
  config: PropTypeConfig_Number
}) => number

export interface PropTypeConfig_Boolean
  extends ISimplePropType<'boolean', boolean> {}

export interface PropTypeConfig_String
  extends ISimplePropType<'string', string> {}

export interface PropTypeConfig_StringLiteral<T extends string>
  extends ISimplePropType<'stringLiteral', T> {
  valuesAndLabels: Record<T, string>
  as: 'menu' | 'switch'
}

export interface PropTypeConfig_Rgba extends ISimplePropType<'rgba', Rgba> {}

export interface PropTypeConfig_Image extends ISimplePropType<'image', Asset> {}
export interface PropTypeConfig_File extends ISimplePropType<'file', File> {}

type DeepPartialCompound<Props extends UnknownValidCompoundProps> = {
  [K in keyof Props]?: DeepPartial<Props[K]>
}

type DeepPartial<Conf extends PropTypeConfig> =
  Conf extends PropTypeConfig_AllSimples
    ? Conf['valueType']
    : Conf extends PropTypeConfig_Compound<infer T>
      ? DeepPartialCompound<T>
      : never

export interface PropTypeConfig_Compound<
  Props extends UnknownValidCompoundProps,
> extends IBasePropType<
    'compound',
    {[K in keyof Props]: Props[K]['valueType']},
    DeepPartialCompound<Props>
  > {
  props: Record<keyof Props, PropTypeConfig>
}

export interface PropTypeConfig_Enum extends IBasePropType<'enum', {}> {
  cases: Record<string, PropTypeConfig>
  defaultCase: string
}

export type PropTypeConfig_AllSimples =
  | PropTypeConfig_Number
  | PropTypeConfig_Boolean
  | PropTypeConfig_String
  | PropTypeConfig_StringLiteral<$IntentionalAny>
  | PropTypeConfig_Rgba
  | PropTypeConfig_Image
  | PropTypeConfig_File

export type PropTypeConfig =
  | PropTypeConfig_AllSimples
  | PropTypeConfig_Compound<$IntentionalAny>
  | PropTypeConfig_Enum

export type UnknownValidCompoundProps = {
  [K in string]: PropTypeConfig
}

/**
 *
 * This does not include Rgba since Rgba does not have a predictable
 * object shape. We prefer to infer that compound props are described as
 * `Record<string, IShorthandProp>` for now.
 *
 * In the future, it might be reasonable to wrap these types up into something
 * which would allow us to differentiate between values at runtime
 * (e.g. `val.type = "Rgba"` vs `val.type = "Compound"` etc)
 */
type UnknownShorthandProp =
  | string
  | number
  | boolean
  | PropTypeConfig
  | UnknownShorthandCompoundProps

/** Given an object like this, we have enough info to predict the compound prop */
export type UnknownShorthandCompoundProps = {
  [K in string]: UnknownShorthandProp
}

export type ShorthandPropToLonghandProp<P extends UnknownShorthandProp> =
  P extends string
    ? PropTypeConfig_String
    : P extends number
      ? PropTypeConfig_Number
      : P extends boolean
        ? PropTypeConfig_Boolean
        : P extends PropTypeConfig
          ? P
          : P extends UnknownShorthandCompoundProps
            ? PropTypeConfig_Compound<
                ShorthandCompoundPropsToLonghandCompoundProps<P>
              >
            : never

export type ShorthandCompoundPropsToInitialValue<
  P extends UnknownShorthandCompoundProps,
> = LonghandCompoundPropsToInitialValue<
  ShorthandCompoundPropsToLonghandCompoundProps<P>
>

type LonghandCompoundPropsToInitialValue<P extends UnknownValidCompoundProps> =
  {
    [K in keyof P]: P[K]['valueType']
  }

export type PropsValue<P> = P extends UnknownValidCompoundProps
  ? LonghandCompoundPropsToInitialValue<P>
  : P extends UnknownShorthandCompoundProps
    ? LonghandCompoundPropsToInitialValue<
        ShorthandCompoundPropsToLonghandCompoundProps<P>
      >
    : never

export type ShorthandCompoundPropsToLonghandCompoundProps<
  P extends UnknownShorthandCompoundProps,
> = {
  [K in keyof P]: ShorthandPropToLonghandProp<P[K]>
}

export const propTypeSymbol = Symbol('TheatrePropType_Basic')

export type Rgba = {
  r: number
  g: number
  b: number
  a: number
}

export type Laba = {
  L: number
  a: number
  b: number
  alpha: number
}

export interface ITransactionAPI {
  /**
   * Set the value of a prop by its pointer. If the prop is sequenced, the value
   * will be a keyframe at the current sequence position.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * studio.transaction(({set}) => {
   *   // set a specific prop's value
   *   set(obj.props.x, 10) // New value is {x: 10, y: 0}
   *   // values are set partially
   *   set(obj.props, {y: 11}) // New value is {x: 10, y: 11}
   *
   *   // this will error, as there is no such prop as 'z'
   *   set(obj.props.z, 10)
   * })
   * ```
   * @param pointer - A Pointer, like object.props
   * @param value - The value to override the existing value. This is treated as a deep partial value.
   */
  set<V>(pointer: Pointer<V>, value: V): void
  /**
   * Unsets the value of a prop by its pointer.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * studio.transaction(({set}) => {
   *   // set props.x to its default value
   *   unset(obj.props.x)
   *   // set all props to their default value
   *   set(obj.props)
   * })
   * ```
   * @param pointer - A pointer, like object.props
   */
  unset<V>(pointer: Pointer<V>): void

  /**
   * EXPERIMENTAL API - this api may be removed without notice.
   *
   * Makes Theatre forget about this object. This means all the prop overrides and sequenced props
   * will be reset, and the object won't show up in the exported state.
   */
  __experimental_forgetObject(object: ISheetObject): void

  /**
   * EXPERIMENTAL API - this api may be removed without notice.
   *
   * Makes Theatre forget about this sheet.
   */
  __experimental_forgetSheet(sheet: ISheet): void

  /**
   * EXPERIMENTAL API - this api may be removed without notice.
   *
   * Sequences a track for the
   */
  __experimental_sequenceProp<V>(pointer: Pointer<V>): void
}
/**
 *
 */
export interface PaneClassDefinition {
  /**
   * Each pane has a `class`, which is a string.
   */
  class: string
  // /**
  //  * A react component that renders the content of the pane. It is given
  //  * a single prop, `paneId`, which is a unique identifier for the pane.
  //  *
  //  * If you wish to store and persist the state of the pane,
  //  * simply use a sheet and an object.
  //  */
  // component: React.ComponentType<{
  //   /**
  //    * The unique identifier of the pane
  //    */
  //   paneId: string
  // }>

  mount: (opts: {paneId: string; node: HTMLElement}) => () => void
}

export type ToolConfigIcon = {
  type: 'Icon'
  svgSource: string
  title: string
  onClick: () => void
}

export type ToolConfigOption = {
  value: string
  label: string
  svgSource: string
}

export type ToolConfigSwitch = {
  type: 'Switch'
  value: string
  onChange: (value: string) => void
  options: ToolConfigOption[]
}

export type ToolconfigFlyoutMenuItem = {
  label: string
  onClick?: () => void
}

export type ToolConfigFlyoutMenu = {
  /**
   * A flyout menu
   */
  type: 'Flyout'
  /**
   * The label of the trigger button
   */
  label: string
  items: ToolconfigFlyoutMenuItem[]
}

export type ToolConfig =
  | ToolConfigIcon
  | ToolConfigSwitch
  | ToolConfigFlyoutMenu

export type ToolsetConfig = Array<ToolConfig>

/**
 * A Theatre.js Studio extension. You can define one either
 * in a separate package, or within your project.
 */
export interface IExtension {
  /**
   * Pick a unique ID for your extension. Ideally the name would be unique if
   * the extension was to be published to the npm repository.
   */
  id: string
  /**
   * Set this if you'd like to add a component to the global toolbar (on the top)
   *
   * @example
   * TODO
   */
  toolbars?: {
    [key in 'global' | string]: (
      set: (config: ToolsetConfig) => void,
      studio: IStudio,
    ) => () => void
  }

  /**
   * Introduces new pane types.
   * @example
   * TODO
   */
  panes?: Array<PaneClassDefinition>
}

export type PaneInstance<ClassName extends string> = {
  extensionId: string
  instanceId: PaneInstanceId
  definition: PaneClassDefinition
}

export interface IStudioUI {
  /**
   * Temporarily hides the studio
   */
  hide(): void
  /**
   * Whether the studio is currently visible or hidden
   */
  readonly isHidden: boolean
  /**
   * Makes the studio visible again.
   */
  restore(): void

  renderToolset(toolsetId: string, htmlNode: HTMLElement): () => void
}

export interface InitOpts {
  studio?: boolean
  /**
   * The local storage key to use to persist the state.
   *
   * Default: "theatrejs:0.4"
   */
  persistenceKey?: string
  /**
   * Whether to persist the changes in the browser's temporary storage.
   * It is useful to set this to false in the test environment or when debugging things.
   *
   * Default: true
   */
  usePersistentStorage?: boolean

  __experimental_rafDriver?: IRafDriver | undefined

  serverUrl?: string | undefined
}

/**
 * This is the public api of Theatre's studio. It is exposed through:
 *
 * @example
 * Basic usage:
 * ```ts
 * import theatre from '@theatre/core'
 *
 * theatre.init({studio: true})
 * ```
 *
 * @example
 * Usage with **tree-shaking**:
 * ```ts
 * import theatre from '@theatre/core'
 *
 * if (process.env.NODE_ENV !== 'production') {
 *   theatre.init({studio: true})
 * }
 * ```
 */
export interface IStudio {
  readonly ui: IStudioUI

  /**
   * Runs an undo-able transaction. Creates a single undo level for all
   * the operations inside the transaction.
   *
   * Will roll back if an error is thrown.
   *
   * @example
   * Usage:
   * ```ts
   * studio.transaction(({set, unset}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   *   unset(obj.props.y) // unset the override at obj.props.y
   * })
   * ```
   */
  transaction(fn: (api: ITransactionAPI) => void): void

  /**
   * Creates a scrub, which is just like a transaction, except you
   * can run it multiple times without creating extra undo levels.
   *
   * @example
   * Usage:
   * ```ts
   * const scrub = studio.scrub()
   * scrub.capture(({set}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   * })
   *
   * // half a second later...
   * scrub.capture(({set}) => {
   *   set(obj.props.y, 11) // set the value of obj.props.y to 11
   *   // note that since we're not setting obj.props.x, its value reverts back to its old value (ie. not 10)
   * })
   *
   * // then either:
   * scrub.commit() // commits the scrub and creates a single undo level
   * // or:
   * scrub.reset() // clear all the ops in the scrub so we can run scrub.capture() again
   * // or:
   * scrub.discard() // clears the ops and destroys it (ie. can't call scrub.capture() anymore)
   * ```
   */
  scrub(): IScrub

  /**
   * Creates a debounced scrub, which is just like a normal scrub, but
   * automatically runs scrub.commit() after `threshhold` milliseconds have
   * passed after the last `scrub.capture`.
   *
   * @param threshhold - How long to wait before committing the scrub
   *
   * @example
   * Usage:
   * ```ts
   * // Will create a new undo-level after 2 seconds have passed
   * // since the last scrub.capture()
   * const scrub = studio.debouncedScrub(2000)
   *
   * // capture some ops
   * scrub.capture(...)
   * // wait one second
   * await delay(1000)
   * // capture more ops but no new undo level is made,
   * // because the last scrub.capture() was called less than 2 seconds ago
   * scrub.capture(...)
   *
   * // wait another seonc and half
   * await delay(1500)
   * // still no new undo level, because less than 2 seconds have passed
   * // since the last capture
   * scrub.capture(...)
   *
   * // wait 3 seconds
   * await delay(3000) // at this point, one undo level is created.
   *
   * // this call to capture will start a new undo level
   * scrub.capture(...)
   * ```
   */
  debouncedScrub(threshhold: number): Pick<IScrub, 'capture'>

  /**
   * Sets the current selection.
   *
   * @example
   * Usage:
   * ```ts
   * const sheet1: ISheet = ...
   * const obj1: ISheetObject<any> = ...
   *
   * studio.setSelection([sheet1, obj1])
   * ```
   *
   * You can read the current selection from studio.selection
   */
  setSelection(selection: Array<ISheetObject<any> | ISheet>): void

  /**
   * Calls fn every time the current selection changes.
   */
  onSelectionChange(
    fn: (s: Array<ISheetObject<{}> | ISheet>) => void,
  ): VoidFunction

  /**
   * The current selection, consisting of Sheets and Sheet Objects
   *
   * @example
   * Usage:
   * ```ts
   * console.log(studio.selection) // => [ISheetObject, ISheet]
   * ```
   */
  readonly selection: Array<ISheetObject<{}> | ISheet>

  /**
   * Registers an extension
   */
  extend(
    /**
     * The extension's definition
     */
    extension: IExtension,
    opts?: {
      /**
       * Whether to reconfigure the extension. This is useful if you're
       * hot-reloading the extension.
       *
       * Mind you, that if the old version of the extension defines a pane,
       * and the new version doesn't, all instances of that pane will disappear, as expected.
       * _However_, if you again reconfigure the extension with the old version, the instances
       * of the pane that pane will re-appear.
       *
       * We're not sure about whether this behavior makes sense or not. If not, let us know
       * in the discord server or open an issue on github.
       */
      __experimental_reconfigure?: boolean
    },
  ): void

  /**
   * Creates a new pane
   *
   * @param paneClass - The class name of the pane (provided by an extension)
   */
  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>

  /**
   * Destroys a previously created pane instance
   *
   * @param paneId - The unique identifier for the pane instance, provided in the 'mount' callback
   */
  destroyPane(paneId: string): void

  /**
   * Returns the Theatre.js project that contains the studio's sheets and objects.
   *
   * It is useful if you'd like to have sheets/objects that are present only when
   * studio is present.
   */
  getStudioProject(): IProject

  /**
   * Creates a JSON object that contains the state of the project. You can use this
   * to programmatically save the state of your projects to the storage system of your
   * choice, rather than manually clicking on the "Export" button in the UI.
   *
   * @param projectId - same projectId as in `core.getProject(projectId)`
   *
   * @example
   * Usage:
   * ```ts
   * const projectId = "project"
   * const json = studio.createContentOfSaveFile(projectId)
   * const string = JSON.stringify(json)
   * fetch(`/projects/${projectId}/state`, {method: 'POST', body: string}).then(() => {
   *   console.log("Saved")
   * })
   * ```
   */
  createContentOfSaveFile(projectId: string): Record<string, unknown>

  __experimental: {
    /**
     * Warning: This is an experimental API and will change in the future.
     *
     * Disables the play/pause keyboard shortcut (spacebar)
     * Also see `__experimental_enablePlayPauseKeyboardShortcut()` to re-enable it.
     */
    __experimental_disablePlayPauseKeyboardShortcut(): void
    /**
     * Warning: This is an experimental API and will change in the future.
     *
     * Disables the play/pause keyboard shortcut (spacebar)
     */
    __experimental_enablePlayPauseKeyboardShortcut(): void
    /**
     * Clears persistent storage and ensures that the current state will not be
     * saved on window unload. Further changes to state will continue writing to
     * persistent storage, if enabled during initialization.
     *
     * @param persistenceKey - same persistencyKey as in `studio.initialize(opts)`, if any
     */
    __experimental_clearPersistentStorage(persistenceKey?: string): void

    /**
     * Warning: This is an experimental API and will change in the future.
     *
     * This is functionally the same as `studio.createContentOfSaveFile()`, but
     * returns a typed object instead of a JSON object.
     *
     * See {@link __UNSTABLE_Project_OnDiskState} for more information.
     */
    __experimental_createContentOfSaveFileTyped(
      projectId: string,
    ): __UNSTABLE_Project_OnDiskState
  }
}

/**
 * The scrub API is a simple construct for changing values in Theatre.js in a history-compatible way.
 * Primarily, it can be used to create a series of value changes using a temp transaction without
 * creating multiple transactions.
 *
 * The name is inspired by the activity of "scrubbing" the value of an input through clicking and
 * dragging left and right. But, the API is not limited to chaning a single prop's value.
 *
 * For now, using the {@link IScrubApi.set} will result in changing the values where the
 * playhead is (the `sequence.position`).
 */
export interface IScrubApi {
  /**
   * Set the value of a prop by its pointer. If the prop is sequenced, the value
   * will be a keyframe at the current playhead position (`sequence.position`).
   *
   * @param pointer - A Pointer, like object.props
   * @param value - The value to override the existing value. This is treated as a deep partial value.
   *
   * @example
   * Usage:
   * ```ts
   * const obj = sheet.object("box", {x: 0, y: 0})
   * const scrub = studio.scrub()
   * scrub.capture(({set}) => {
   *   // set a specific prop's value
   *   set(obj.props.x, 10) // New value is {x: 10, y: 0}
   *   // values are set partially
   *   set(obj.props, {y: 11}) // New value is {x: 10, y: 11}
   *
   *   // this will error, as there is no such prop as 'z'
   *   set(obj.props.z, 10)
   * })
   * ```
   */
  set<T>(pointer: Pointer<T>, value: T): void
}

export interface IScrub {
  /**
   * Clears all the ops in the scrub, but keeps the scrub open so you can call
   * `scrub.capture()` again.
   */
  reset(): void
  /**
   * Commits the scrub and creates a single undo level.
   */
  commit(): void
  /**
   * Captures operations for the scrub.
   *
   * Note that running `scrub.capture()` multiple times means all the older
   * calls of `scrub.capture()` will be reset.
   *
   * @example
   * Usage:
   * ```ts
   * scrub.capture(({set}) => {
   *   set(obj.props.x, 10) // set the value of obj.props.x to 10
   * })
   * ```
   */
  capture(fn: (api: IScrubApi) => void): void

  /**
   * Clears the ops of the scrub and destroys it. After calling this,
   * you won't be able to call `scrub.capture()` anymore.
   */
  discard(): void
}
