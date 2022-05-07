import type {
  IBasePropType,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'
import type {IEditingTools} from './IEditingTools'

/** Helper for defining consistent prop editor components */
export type ISimplePropEditorVFC<
  TPropTypeConfig extends IBasePropType<string, any>,
> = React.VFC<{
  propConfig: TPropTypeConfig
  editingTools: IEditingTools<TPropTypeConfig['valueType']>
  value: TPropTypeConfig['valueType']
}>

export type ISimplePropKeyframeEditorVFC<
  TPropTypeConfig extends IBasePropType<string, any>,
> = React.VFC<{
  propConfig: TPropTypeConfig
  editingTools: IEditingTools<TPropTypeConfig['valueType']>
  keyframeValue: TPropTypeConfig['valueType']
  SimpleEditorComponent: ISimplePropEditorVFC<TPropTypeConfig>
}>

export type ISimplePropDetailEditorVFC<
  TPropTypeConfig extends IBasePropType<string, any>,
> = React.VFC<{
  propConfig: TPropTypeConfig
  pointerToProp: Pointer<TPropTypeConfig['valueType']>
  obj: SheetObject
  visualIndentation: number
  SimpleEditorComponent: ISimplePropEditorVFC<TPropTypeConfig>
}>

export type ICompoundPropDetailEditorVFC<
  TPropTypeConfig extends PropTypeConfig_Compound<any>,
> = React.VFC<{
  propConfig: TPropTypeConfig
  pointerToProp: Pointer<TPropTypeConfig['valueType']>
  obj: SheetObject
  visualIndentation: number
}>
