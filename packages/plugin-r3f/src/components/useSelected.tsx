import {useLayoutEffect, useRef, useState} from 'react'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import studio from '@theatre/studio'

export function useSelected(): undefined | string {
  const [state, set] = useState<string | undefined>(undefined)
  const stateRef = useRef(state)
  stateRef.current = state

  const sheet = useEditorStore((state) => state.sheet, shallow)

  useLayoutEffect(() => {
    const setFromStudio = (selection: typeof studio.selection) => {
      const item = selection.find((s) => s.sheet === sheet)
      if (!item) {
        set(undefined)
      } else {
        set(item.address.objectKey)
      }
    }
    setFromStudio(studio.selection)
    return studio.onSelectionChange(setFromStudio)
  }, [sheet])

  return state
}

export function getSelected(): undefined | string {
  const sheet = useEditorStore.getState().sheet
  if (!sheet) return undefined
  const item = studio.selection.find((s) => s.sheet === sheet)
  if (!item) {
    return undefined
  } else {
    return item.address.objectKey
  }
}
