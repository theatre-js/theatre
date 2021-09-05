import {useLayoutEffect, useRef, useState} from 'react'
import {allRegisteredObjects} from '../store'
import studio from '@theatre/studio'
import type {ISheetObject} from '@theatre/core'

export function useSelected(): undefined | string {
  const [state, set] = useState<string | undefined>(undefined)
  const stateRef = useRef(state)
  stateRef.current = state

  useLayoutEffect(() => {
    const setFromStudio = (selection: typeof studio.selection) => {
      const item = selection.find(
        (s): s is ISheetObject =>
          s.type === 'Theatre_SheetObject_PublicAPI' &&
          allRegisteredObjects.has(s),
      )
      if (!item) {
        set(undefined)
      } else {
        set(item.address.objectKey)
      }
    }
    setFromStudio(studio.selection)
    return studio.onSelectionChange(setFromStudio)
  }, [])

  return state
}

export function getSelected(): undefined | string {
  const item = studio.selection.find(
    (s): s is ISheetObject =>
      s.type === 'Theatre_SheetObject_PublicAPI' && allRegisteredObjects.has(s),
  )
  if (!item) {
    return undefined
  } else {
    return item.address.objectKey
  }
}
