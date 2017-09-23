// @flow
import type {AnimationTimelineNamespaceState} from './types'

const defaultState: AnimationTimelineNamespaceState = {
  curves: {
    byId: {},
  },
  lanes: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c717': {
        id: '8daa7380-9b43-475a-8352-dc564a58c717',
        name: 'button-bottom',
        curves: [],
      },
      '8daa7380-9b43-475a-8352-dc564a58c716': {
        id: '8daa7380-9b43-475a-8352-dc564a58c716',
        name: 'button-left',
        curves: [],
      },
      '8daa7380-9b43-475a-8352-dc564a58c715': {
        id: '8daa7380-9b43-475a-8352-dc564a58c715',
        name: 'SamplePlayground-top',
        curves: [],
      },
      '8daa7380-9b43-475a-8352-dc564a58c714': {
        id: '8daa7380-9b43-475a-8352-dc564a58c714',
        name: 'SamplePlayground-left',
        curves: [],
      },
      '8daa7380-9b43-475a-8352-dc564a58c713': {
        id: '8daa7380-9b43-475a-8352-dc564a58c713',
        name: 'div-top',
        curves: [],
      },
    },
  },
  timelines: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c710': {
        layout: ['8daa7380-9b43-475a-8352-dc564a58c726',
          '8daa7380-9b43-475a-8352-dc564a58c725',
          '8daa7380-9b43-475a-8352-dc564a58c724',
          '8daa7380-9b43-475a-8352-dc564a58c723'],
        boxes: {
          '8daa7380-9b43-475a-8352-dc564a58c726': {
            id: '8daa7380-9b43-475a-8352-dc564a58c726',
            height: 50,
            lanes: ['8daa7380-9b43-475a-8352-dc564a58c716', '8daa7380-9b43-475a-8352-dc564a58c717'],
          },
          '8daa7380-9b43-475a-8352-dc564a58c725': {
            id: '8daa7380-9b43-475a-8352-dc564a58c725',
            height: 40,
            lanes: ['8daa7380-9b43-475a-8352-dc564a58c715'],
          },
          '8daa7380-9b43-475a-8352-dc564a58c724': {
            id: '8daa7380-9b43-475a-8352-dc564a58c724',
            height: 60,
            lanes: ['8daa7380-9b43-475a-8352-dc564a58c714'],
          },
          '8daa7380-9b43-475a-8352-dc564a58c723': {
            id: '8daa7380-9b43-475a-8352-dc564a58c723',
            height: 80,
            lanes: ['8daa7380-9b43-475a-8352-dc564a58c713'],
          },
        },
      },
    },
  },
}

export default (state: AnimationTimelineNamespaceState = defaultState) => state