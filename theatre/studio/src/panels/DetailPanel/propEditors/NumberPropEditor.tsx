import type {PropTypeConfig_Number} from '@theatre/core/propTypes'
import BasicNumberInput from '@theatre/studio/uiComponents/form/BasicNumberInput'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import type {IPropEditorFC} from './utils/IPropEditorFC'

const NumberPropEditor: IPropEditorFC<PropTypeConfig_Number> = ({
  propConfig,
  pointerToProp,
  obj,
}) => {
  const stuff = useEditingToolsForPrimitiveProp<number>(
    pointerToProp,
    obj,
    propConfig,
  )

  const nudge = useCallback(
    (params: {deltaX: number; deltaFraction: number; magnitude: number}) => {
      return propConfig.nudgeFn({...params, config: propConfig})
    },
    [propConfig],
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <BasicNumberInput
        value={stuff.value}
        temporarilySetValue={stuff.temporarilySetValue}
        discardTemporaryValue={stuff.discardTemporaryValue}
        permanentlySetValue={stuff.permanentlySetValue}
        range={propConfig.range}
        nudge={nudge}
      />
    </SingleRowPropEditor>
  )
}

export default NumberPropEditor
