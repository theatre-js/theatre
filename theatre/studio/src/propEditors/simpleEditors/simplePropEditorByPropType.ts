import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type React from 'react'
import BooleanPropEditor from './BooleanPropEditor'
import NumberPropEditor from './NumberPropEditor'
import StringLiteralPropEditor from './StringLiteralPropEditor'
import StringPropEditor from './StringPropEditor'
import RgbaPropEditor from './RgbaPropEditor'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'
import type {PropConfigForType} from '@theatre/studio/propEditors/utils/PropConfigForType'

export const simplePropEditorByPropType: ISimplePropEditorByPropType = {
  number: NumberPropEditor,
  string: StringPropEditor,
  boolean: BooleanPropEditor,
  stringLiteral: StringLiteralPropEditor,
  rgba: RgbaPropEditor,
}

type ISimplePropEditorByPropType = {
  [K in PropTypeConfig_AllSimples['type']]: React.VFC<
    ISimplePropEditorReactProps<PropConfigForType<K>>
  >
}
