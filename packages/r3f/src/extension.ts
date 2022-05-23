import SnapshotEditor from './components/SnapshotEditor'
import type {IExtension} from '@theatre/studio'
import GlobalToolbar from './components/GlobalToolbar'

const r3fExtension: IExtension = {
  id: '@theatre/r3f',
  globalToolbar: {
    component: GlobalToolbar,
  },
  panes: [
    {
      class: 'snapshot',
      component: SnapshotEditor,
    },
  ],
}

export default r3fExtension
