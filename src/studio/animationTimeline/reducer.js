// @flow
import type {AnimationTimelineNamespaceState} from './types'

const defaultState: AnimationTimelineNamespaceState = {
  lanes: {
    byId: {
      '8daa7380-9b43-475a-8352-dc564a58c717': {
        id: '8daa7380-9b43-475a-8352-dc564a58c717',
        component: 'button',
        property: 'bottom',
        extremums: [0, 60],
        points: [
          {
            id: '1',
            t: 10,
            value: 20,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '2',
            t: 20,
            value: 10,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '3',
            t: 30,
            value: 30,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '4',
            t: 50,
            value: 5,
            isConnected: false,
            handles: [-5, 0, 5, 0],
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
            id: '1',
            t: 30,
            value: 20,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '2',
            t: 40,
            value: 10,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '3',
            t: 50,
            value: 30,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '4',
            t: 55,
            value: -5,
            isConnected: false,
            handles: [-5, 0, 5, 0],
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
            id: '1',
            t: 10,
            value: 50,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '2',
            t: 20,
            value: 10,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '3',
            t: 31,
            value: 50,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '4',
            t: 43,
            value: 5,
            isConnected: false,
            handles: [-5, 0, 5, 0],
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
            id: '1',
            t: 5,
            value: 25,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '2',
            t: 17,
            value: 15,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '3',
            t: 29,
            value: 35,
            isConnected: true,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '4',
            t: 40,
            value: 10,
            isConnected: false,
            handles: [-5, 0, 5, 0],
          },
        ],
      },
      '8daa7380-9b43-475a-8352-dc564a58c713': {
        id: '8daa7380-9b43-475a-8352-dc564a58c713',
        component: 'div',
        property: 'top',
        extremums: [-5, 15],
        points: [
          {
            id: '1',
            t: 10,
            value: 0,
            isConnected: false,
            handles: [-5, 0, 5, 0],
          },
          {
            id: '2',
            t: 10,
            value: 10,
            isConnected: false,
            handles: [-5, 0, 5, 0],
          },
        ],
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
            height: 60,
            lanes: ['8daa7380-9b43-475a-8352-dc564a58c716', '8daa7380-9b43-475a-8352-dc564a58c717'],
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

export default (state: AnimationTimelineNamespaceState = defaultState) => state