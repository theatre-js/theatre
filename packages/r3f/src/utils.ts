import {useEditorStore} from './store'

export const refreshSnapshot = useEditorStore.getState().createSnapshot
