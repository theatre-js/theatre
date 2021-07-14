import SnapshotEditor from './components/SnapshotEditor'

export {default as EditorHelper} from './components/EditorHelper'
export type {EditorHelperProps} from './components/EditorHelper'

export {default as editable} from './components/editable'
export {bindToCanvas} from './store'
export type {EditableState, BindFunction} from './store'
import studio from '@theatre/studio'
import Toolbar from './components/Toolbar/Toolbar'
import {types} from '@theatre/core'

if (process.env.NODE_ENV === 'development') {
  studio.extend({
    id: '@theatre/plugin-r3f',
    globalToolbar: {
      component: Toolbar,
    },
    panes: [
      {
        class: 'snapshotEditor',
        dataType: types.compound({
          grosse: types.number(20),
        }),
        component: SnapshotEditor,
      },
    ],
  })
}
