import React from 'react'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'
import type {$FixMe} from '@theatre/shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal} from '@theatre/react'
import uniqueKeyForAnyObject from '@theatre/shared/utils/uniqueKeyForAnyObject'
import getStudio from '@theatre/studio/getStudio'
import styled from 'styled-components'

const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border-radius: 2px;

  color: #a8a8a9;
  background: rgba(255, 255, 255, 0.1);

  border: none;
  height: 28px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`

const ObjectDetails: React.FC<{
  /** TODO: add support for multiple objects (it would show their common props) */
  objects: [SheetObject]
}> = ({objects}) => {
  const obj = objects[0]
  const config = useVal(obj.template.configPointer)
  const actions = useVal(obj.template.actionsPointer)

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
      <ActionButtonContainer>
        {actions &&
          Object.entries(actions).map(([actionName, action]) => {
            return (
              <ActionButton
                key={actionName}
                onClick={() => {
                  action(obj.publicApi, getStudio().publicApi)
                }}
              >
                {actionName}
              </ActionButton>
            )
          })}
      </ActionButtonContainer>
    </>
  )
}

export default ObjectDetails
