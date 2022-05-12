import React, {useMemo} from 'react'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'
import type {$FixMe} from '@theatre/shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'

const ObjectDetails: React.FC<{
  /** TODO: add support for multiple objects (it would show their common props) */
  objects: [SheetObject]
}> = ({objects}) => {
  const obj = objects[0]
  const key = useMemo(() => JSON.stringify(obj.address), [obj])

  return (
    <DeterminePropEditorForDetail
      key={key}
      obj={obj}
      pointerToProp={obj.propsP as Pointer<$FixMe>}
      propConfig={obj.template.config}
      visualIndentation={1}
    />
  )
}

export default ObjectDetails
