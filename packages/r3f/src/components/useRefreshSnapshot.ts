import {useCallback} from 'react'
import {useEditorStore} from '../store'

/**
 * Returns a function that can be called to refresh the snapshot in the snapshot editor.
 */
export default function useRefreshSnapshot() {
  return useCallback(() => {
    useEditorStore.getState().createSnapshot()
  }, [])
}
