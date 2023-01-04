import React from 'react'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'
import type {$FixMe} from '@theatre/shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal} from '@theatre/react'
import uniqueKeyForAnyObject from '@theatre/shared/utils/uniqueKeyForAnyObject'
import getStudio from '@theatre/studio/getStudio'

const ObjectDetails: React.FC<{
  /** TODO: add support for multiple objects (it would show their common props) */
  objects: [SheetObject]
}> = ({objects}) => {
  const obj = objects[0]
  const config = useVal(obj.template.configPointer)
  const actions = useVal(obj.template.actionsPointer)

  console.log(actions)

  return (
    <>
      <DeterminePropEditorForDetail
        // we don't use the object's address as the key because if a user calls `sheet.detachObject(key)` and later
        // calls `sheet.object(key)` with the same key, we want to re-render the object details panel.
        key={uniqueKeyForAnyObject(obj)}
        obj={obj}
        pointerToProp={obj.propsP as Pointer<$FixMe>}
        propConfig={config}
        visualIndentation={1}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {actions &&
          Object.entries(actions).map(([actionName, action]) => {
            return (
              <button
                key={actionName}
                onClick={() => {
                  action(obj.publicApi, getStudio().publicApi)
                }}
              >
                {actionName}
              </button>
            )
          })}
      </div>
    </>
  )
}

export default ObjectDetails
