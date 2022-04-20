import type {PropTypeConfig_Marker} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import type {MarkerPropType} from '@theatre/shared/utils/markerPropType'

const MarkerPropEditor: React.FC<{
  propConfig: PropTypeConfig_Marker
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<MarkerPropType>(
    pointerToProp,
    obj,
    propConfig,
  )

  const setValue = useCallback(
    (val: MarkerPropType) => {
      stuff.permenantlySetValue(val)
    },
    [propConfig, pointerToProp, obj],
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <button
        onClick={() =>
          setValue({
            metaType: 'marker',
            rgba: {r: 0.2, g: 1, b: 0.3, a: 1},
            text: 'Green',
          })
        }
      >
        Green
      </button>
      <button
        onClick={() =>
          setValue({
            metaType: 'marker',
            rgba: {r: 1, g: 0.3, b: 0.2, a: 1},
            text: 'Red',
          })
        }
      >
        Red
      </button>
    </SingleRowPropEditor>
  )
}

export default MarkerPropEditor
