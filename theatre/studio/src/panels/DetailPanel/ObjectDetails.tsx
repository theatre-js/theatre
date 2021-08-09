import React, {useMemo} from 'react'
import DeterminePropEditor from './propEditors/DeterminePropEditor'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

const ObjectDetails: React.FC<{
  objects: SheetObject[]
}> = ({objects}) => {
  // @todo add support for multiple objects (it would show their common props)
  const obj = objects[0]
  const key = useMemo(() => JSON.stringify(obj.address), [obj])

  return (
    <DeterminePropEditor
      key={key}
      obj={obj}
      pointerToProp={obj.propsP}
      propConfig={obj.template.config}
      depth={1}
    />
  )
}

export default ObjectDetails
