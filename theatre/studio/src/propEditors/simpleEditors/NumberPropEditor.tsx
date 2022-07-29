import type {PropTypeConfig_Number} from '@theatre/core/propTypes'
import {useDerivation} from '@theatre/react'
import BasicNumberInput from '@theatre/studio/uiComponents/form/BasicNumberInput'
import React, {useCallback} from 'react'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

function NumberPropEditor({
  propConfig,
  editingToolsD,
  valueD,
}: ISimplePropEditorReactProps<PropTypeConfig_Number>) {
  const editingTools = useDerivation(editingToolsD)

  const nudge = useCallback(
    (params: {deltaX: number; deltaFraction: number; magnitude: number}) => {
      return propConfig.nudgeFn({...params, config: propConfig})
    },
    [propConfig],
  )

  return (
    <BasicNumberInput
      valueD={valueD}
      temporarilySetValue={editingTools.temporarilySetValue}
      discardTemporaryValue={editingTools.discardTemporaryValue}
      permanentlySetValue={editingTools.permanentlySetValue}
      range={propConfig.range}
      nudge={nudge}
    />
  )
}

export default NumberPropEditor
