import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import type {SheetObjectAddress} from '@theatre/core/types/public'
import SimpleCache from '@theatre/utils/SimpleCache'
import type {$FixMe, VoidFn} from '@theatre/utils/types'
import type {Prism, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import type SheetObject from './SheetObject'
import {debounce} from 'lodash-es'
import type {DebouncedFunc} from 'lodash-es'
import type {
  IProject,
  IRafDriver,
  ISheet,
  ISheetObject,
  PropsValue,
  UnknownShorthandCompoundProps,
  DeepPartialOfSerializableValue,
} from '@theatre/core/types/public'
import {onChange} from '@theatre/core/coreExports'

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
            console.warn(
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
