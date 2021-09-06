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
  IShorthandCompoundProps,
  ShorthandPropToLonghandProp,
} from '@theatre/core/propTypes/internals'

export interface ISheetObject<Props extends IShorthandCompoundProps = {}> {
  readonly type: 'Theatre_SheetObject_PublicAPI'

  /**
   *
   */
  readonly value: ShorthandPropToLonghandProp<Props>['valueType']
  readonly props: Pointer<this['value']>

  readonly sheet: ISheet
  readonly project: IProject
  readonly address: SheetObjectAddress

  onValuesChange(fn: (values: this['value']) => void): VoidFn
  // prettier-ignore
  set initialValue(value: DeepPartialOfSerializableValue<this['value']>)
}

export default class TheatreSheetObject<
  Props extends IShorthandCompoundProps = {},
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
      const d: IDerivation<Props> = prism(() => {
        return val(sheetObject.getValues().getValue()) as $FixMe
      })
      return d
    })
  }

  onValuesChange(fn: (values: this['value']) => void): VoidFn {
    return this._valuesDerivation().tapImmediate(coreTicker, fn)
  }

  get value(): ShorthandPropToLonghandProp<Props>['valueType'] {
    return this._valuesDerivation().getValue()
  }

  set initialValue(val: DeepPartialOfSerializableValue<this['value']>) {
    privateAPI(this).setInitialValue(val)
  }
}
