import {privateAPI, setPrivateAPI} from '@theatre/shared/privateAPIs'
import type {IProject} from '@theatre/core/projects/TheatreProject'
import coreTicker from '@theatre/core/coreTicker'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  $IntentionalAny,
  DeepPartialOfSerializableValue,
  VoidFn,
} from '@theatre/shared/utils/types'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import type {PropTypeConfig_Compound} from '@theatre/shared/propTypes'
import type SheetObject from './SheetObject'

export interface ISheetObject<
  Props extends PropTypeConfig_Compound<$IntentionalAny> = PropTypeConfig_Compound<$IntentionalAny>,
> {
  readonly type: 'Theatre_SheetObject_PublicAPI'
  /**
   * The type of the values of the SheetObject.
   */
  readonly value: Props['valueType']
  readonly props: Pointer<Props['valueType']>

  readonly sheet: ISheet
  readonly project: IProject
  readonly address: SheetObjectAddress

  onValuesChange(fn: (values: Props['valueType']) => void): VoidFn
  // prettier-ignore
  set initialValue(value: DeepPartialOfSerializableValue<Props['valueType']>)
}

export default class TheatreSheetObject<
  Props extends PropTypeConfig_Compound<$IntentionalAny>,
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

  get props(): Pointer<Props['valueType']> {
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

  private _valuesDerivation(): IDerivation<Props['valueType']> {
    return this._cache.get('onValuesChangeDerivation', () => {
      const sheetObject = privateAPI(this)
      const d: IDerivation<Props> = prism(() => {
        return val(sheetObject.getValues().getValue()) as $FixMe
      })
      return d
    })
  }

  onValuesChange(fn: (values: Props['valueType']) => void): VoidFn {
    return this._valuesDerivation().tapImmediate(coreTicker, fn)
  }

  get value(): Props['valueType'] {
    return this._valuesDerivation().getValue()
  }

  set initialValue(val: DeepPartialOfSerializableValue<Props['valueType']>) {
    privateAPI(this).setInitialValue(val)
  }
}
