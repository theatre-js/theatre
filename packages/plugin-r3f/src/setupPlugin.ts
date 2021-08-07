import SnapshotEditor from './components/SnapshotEditor'
import studio from '@theatre/studio'
import Toolbar from './components/Toolbar/Toolbar'
import {types} from '@theatre/core'

export default function setupPlugin() {
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
