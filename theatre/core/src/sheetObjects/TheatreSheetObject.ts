import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import type {IProject} from '@theatre/core/projects/TheatreProject'
import coreTicker from '@theatre/core/coreTicker'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  DeepPartialOfSerializableValue,
  VoidFn,
} from '@theatre/shared/utils/types'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import type SheetObject from './SheetObject'
import type {
  UnknownShorthandCompoundProps,
  PropsValue,
} from '@theatre/core/propTypes/internals'

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
  onValuesChange(fn: (values: this['value']) => void): VoidFn

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

export default class TheatreSheetObject<
  Props extends UnknownShorthandCompoundProps = UnknownShorthandCompoundProps,
> implements ISheetObject<Props>
{
  get type(): 'Theatre_SheetObject_PublicAPI' {
    return 'Theatre_SheetObject_PublicAPI'
  }
  private readonly _cache = new SimpleCache()

  /**
   * @internal
   */
  constructor(internals: SheetObject) {
    setPrivateAPI(this, internals)
  }

  get props(): Pointer<this['value']> {
    return privateAPI(this).propsP as $FixMe
  }

  get sheet(): ISheet {
    return privateAPI(this).sheet.publicApi
  }

  get project(): IProject {
    return privateAPI(this).sheet.project.publicApi
  }

  get address(): SheetObjectAddress {
    return {...privateAPI(this).address}
  }

  private _valuesDerivation(): IDerivation<this['value']> {
    return this._cache.get('onValuesChangeDerivation', () => {
      const sheetObject = privateAPI(this)
      const d: IDerivation<PropsValue<Props>> = prism(() => {
        return val(sheetObject.getValues().getValue()) as $FixMe
      })
      return d
    })
  }

  onValuesChange(fn: (values: this['value']) => void): VoidFn {
    return this._valuesDerivation().tapImmediate(coreTicker, fn)
  }

  get value(): PropsValue<Props> {
    return this._valuesDerivation().getValue()
  }

  set initialValue(val: DeepPartialOfSerializableValue<this['value']>) {
    privateAPI(this).setInitialValue(val)
  }
}
