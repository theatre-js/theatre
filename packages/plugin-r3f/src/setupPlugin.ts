import SnapshotEditor from './components/SnapshotEditor'
import studio from '@theatre/studio'
import Toolbar from './components/Toolbar/Toolbar'

export default function setupPlugin() {
  studio.extend({
    id: '@theatre/plugin-r3f',
    globalToolbar: {
      component: Toolbar,
    },
    panes: [
      {
        class: 'snapshotEditor',
        component: SnapshotEditor,
      },
    ],
  })
}
