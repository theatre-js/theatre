import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import type {IProject} from '@theatre/core/projects/TheatreProject'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  DeepPartialOfSerializableValue,
  VoidFn,
} from '@theatre/shared/utils/types'
import type {Prism, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import type SheetObject from './SheetObject'
import type {
  UnknownShorthandCompoundProps,
  PropsValue,
} from '@theatre/core/propTypes/internals'
import {debounce} from 'lodash-es'
import type {DebouncedFunc} from 'lodash-es'
import type {IRafDriver} from '@theatre/core/rafDrivers'
import {onChange} from '@theatre/core/coreExports'

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

// Enabled for https://linear.app/theatre/issue/P-217/if-objvalue-is-read-make-sure-its-derivation-remains-hot-for-a-while
// Disable to test old behavior
const KEEP_HOT_FOR_MS: undefined | number = 5 * 1000

export default class TheatreSheetObject<
  Props extends UnknownShorthandCompoundProps = UnknownShorthandCompoundProps,
> implements ISheetObject<Props>
{
  get type(): 'Theatre_SheetObject_PublicAPI' {
    return 'Theatre_SheetObject_PublicAPI'
  }
  private readonly _cache = new SimpleCache()
  /** @internal See https://linear.app/theatre/issue/P-217/if-objvalue-is-read-make-sure-its-derivation-remains-hot-for-a-while */
  private _keepHotUntapDebounce: undefined | DebouncedFunc<VoidFn> = undefined

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

  private _valuesPrism(): Prism<this['value']> {
    return this._cache.get('_valuesPrism', () => {
      const sheetObject = privateAPI(this)
      const d: Prism<PropsValue<Props>> = prism(() => {
        return val(sheetObject.getValues().getValue()) as $FixMe
      })
      return d
    })
  }

  onValuesChange(
    fn: (values: this['value']) => void,
    rafDriver?: IRafDriver,
  ): VoidFn {
    return onChange(this._valuesPrism(), fn, rafDriver)
  }

  // internal: Make the deviration keepHot if directly read
  get value(): PropsValue<Props> {
    const der = this._valuesPrism()
    if (KEEP_HOT_FOR_MS != null) {
      if (!der.isHot) {
        // prism not hot, so keep it hot and set up `_keepHotUntapDebounce`
        if (this._keepHotUntapDebounce != null) {
          // defensive checks
          if (process.env.NODE_ENV === 'development') {
            privateAPI(this)._logger.errorDev(
              '`sheet.value` keepHot debouncer is set, even though the derivation is not actually hot.',
            )
          }
          // "flush" calls the `untap()` for previous `.keepHot()`.
          // This is defensive, as this code path is also already an invariant.
          // We have to flush though to avoid calling keepHot a second time and introducing two or more debounce fns.
          this._keepHotUntapDebounce.flush()
        }

        const untap = der.keepHot()
        // add a debounced function, so we keep this hot for some period of time that this .value is being read
        this._keepHotUntapDebounce = debounce(() => {
          untap()
          this._keepHotUntapDebounce = undefined
        }, KEEP_HOT_FOR_MS)
      }

      if (this._keepHotUntapDebounce) {
        // we enabled this "keep hot" and need to keep refreshing the timer on the debounce
        // See https://linear.app/theatre/issue/P-217/if-objvalue-is-read-make-sure-its-derivation-remains-hot-for-a-while
        this._keepHotUntapDebounce()
      }
    }
    return der.getValue()
  }

  set initialValue(val: DeepPartialOfSerializableValue<this['value']>) {
    privateAPI(this).setInitialValue(val)
  }
}
