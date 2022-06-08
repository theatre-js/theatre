import type {IBasePropType} from '@theatre/core/propTypes'
import type {IDerivation} from '@theatre/dataverse'
import type {IEditingTools} from '@theatre/studio/propEditors/utils/IEditingTools'

/** Helper for defining consistent prop editor components */
export type ISimplePropEditorReactProps<
  TPropTypeConfig extends IBasePropType<string, any>,
> = {
  propConfig: TPropTypeConfig
  editingToolsD: IDerivation<IEditingTools<TPropTypeConfig['valueType']>>
  valueD: IDerivation<TPropTypeConfig['valueType']>
}
