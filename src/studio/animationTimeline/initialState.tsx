// @flow
import {AnimationTimelineNamespaceState} from './types'

const initialState: AnimationTimelineNamespaceState = {
  lanes: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c717': {
        id: '8daa7380-9b43-475a-8352-dc564a58c717',
        component: 'button',
        property: 'bottom',
        extremums: [0, 60],
        points: [
          {
            t: 10000,
            value: 20,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 20000,
            value: 10,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 30000,
            value: 30,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 50000,
            value: 5,
            isConnected: false,
            handles: [-0.2, 0, 0.2, 0],
          },
        ],
      },
      '8daa7380-9b43-475a-8352-dc564a58c716': {
        id: '8daa7380-9b43-475a-8352-dc564a58c716',
        component: 'button',
        property: 'left',
        extremums: [-20, 40],
        points: [
          {
            t: 30000,
            value: 20,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 40000,
            value: 10,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 50000,
            value: 30,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 55000,
            value: -5,
            isConnected: false,
            handles: [-0.2, 0, 0.2, 0],
          },
        ],
      },
      '8daa7380-9b43-475a-8352-dc564a58c715': {
        id: '8daa7380-9b43-475a-8352-dc564a58c715',
        component: 'SamplePlayground',
        property: 'top',
        extremums: [0, 60],
        points: [
          {
            t: 10000,
            value: 50,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 20000,
            value: 10,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 31000,
            value: 50,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 43000,
            value: 5,
            isConnected: false,
            handles: [-0.2, 0, 0.2, 0],
          },
        ],
      },
      '8daa7380-9b43-475a-8352-dc564a58c714': {
        id: '8daa7380-9b43-475a-8352-dc564a58c714',
        component: 'SamplePlayground',
        property: 'left',
        extremums: [0, 60],
        points: [
          {
            t: 5000,
            value: 25,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 17000,
            value: 15,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 29000,
            value: 35,
            isConnected: true,
            handles: [-0.2, 0, 0.2, 0],
          },
          {
            t: 40000,
            value: 10,
            isConnected: false,
            handles: [-0.2, 0, 0.2, 0],
          },
        ],
      },
      '8daa7380-9b43-475a-8352-dc564a58c713': {
        id: '8daa7380-9b43-475a-8352-dc564a58c713',
        component: 'div',
        property: 'top',
        extremums: [-10, 60],
        points: [],
      },
    },
  },
  timelines: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c710': {
        layout: [
          '8daa7380-9b43-475a-8352-dc564a58c726',
          '8daa7380-9b43-475a-8352-dc564a58c725',
          '8daa7380-9b43-475a-8352-dc564a58c724',
          '8daa7380-9b43-475a-8352-dc564a58c723',
        ],
        boxes: {
          '8daa7380-9b43-475a-8352-dc564a58c726': {
            id: '8daa7380-9b43-475a-8352-dc564a58c726',
            height: 60,
            lanes: [
              '8daa7380-9b43-475a-8352-dc564a58c716',
              '8daa7380-9b43-475a-8352-dc564a58c717',
            ],
          },
          '8daa7380-9b43-475a-8352-dc564a58c725': {
            id: '8daa7380-9b43-475a-8352-dc564a58c725',
            height: 80,
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

export default initialState
