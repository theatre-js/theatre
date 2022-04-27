import type {IBasePropType} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'

/** Helper for defining consistent prop editor components */
export type IPropEditorFC<TPropTypeConfig extends IBasePropType<string, any>> =
  React.FC<{
    propConfig: TPropTypeConfig
    pointerToProp: Pointer<TPropTypeConfig['valueType']>
    obj: SheetObject
    depth: number
  }>
