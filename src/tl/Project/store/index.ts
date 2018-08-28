import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import {
  ProjectAhistoricState,
  ProjectState,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import allInOneStoreBundle from '$shared/utils/redux/allInOneStoreBundle'

const initialHistoricState: ProjectHistoricState = {
  internalTimeines: {
    'Bouncing Ball / The ball': {
      objects: {
        'Act 1 / Stage / Ball': {
          props: {
            opacity: {
              valueContainer: /* {type: 'StaticValueContainer', value: 0.5} */ {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  {
                    time: 0,
                    value: 0,
                    interpolationDescriptor: {
                      connected: true,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                  {
                    time: 1550,
                    value: 1,
                    interpolationDescriptor: {
                      connected: true,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                  {
                    time: 3190,
                    value: 0.5,
                    interpolationDescriptor: {
                      connected: true,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                  {
                    time: 6190,
                    value: 1,
                    interpolationDescriptor: {
                      connected: true,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                  ...(Array.from(new Array(21).keys()).map(i => ({
                    time: 6500 + 650 * i,
                    value: Math.random() * 200 - 100,
                    interpolationDescriptor: {
                      connected: i < 20,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  })) as any),
                ],
              },
            },
            'position.x': {
              valueContainer: {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  ...(Array.from(new Array(21).keys()).map(i => ({
                    time: i * 1000,
                    value: Math.random() * 100,
                    interpolationDescriptor: {
                      connected: i < 20,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  })) as any),
                ],
              },
            },
            'position.y': {
              valueContainer: {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  ...(Array.from(new Array(21).keys()).map(i => ({
                    time: i * 1000,
                    value: Math.random() * 100,
                    interpolationDescriptor: {
                      connected: i < 20,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  })) as any),
                ],
              },
            },
            'position.x': {
              valueContainer: {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  {
                    time: 0,
                    value: 0,
                    interpolationDescriptor: {
                      connected: true,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                  {
                    time: 2000,
                    value: 300,
                    interpolationDescriptor: {
                      connected: false,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  },
                ],
              },
            }
          },
        },
        'Act 1 / Stage / Ball / The dangling thing': {
          props: {
            opacity: {
              // valueContainer: {type: 'StaticValueContainer', value: 0.5}
              valueContainer: {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  ...(Array.from(new Array(21).keys()).map(i => ({
                    time: i * 1000,
                    value: Math.random() * 100,
                    interpolationDescriptor: {
                      connected: i < 20,
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      interpolationType: 'CubicBezier',
                      handles: [0.5, 0, 0.5, 0],
                    },
                  })) as any),
                ],
              },
            },
          },
        },
      },
    },
  },
}

const projectInitialState: ProjectState = {
  ahistoric: {},
  historic: {
    ...initialHistoricState,
    '@@history': {
      commitsByHash: {},
      currentCommitHash: undefined,
      innerState: {
        ...initialHistoricState,
      },
      listOfCommitHashes: [],
    },
    '@@tempActions': [],
  },
  ephemeral: {
    initialised: true,
  },
}

const {actions: projectActions, rootReducer} = allInOneStoreBundle<
  ProjectHistoricState,
  ProjectAhistoricState,
  ProjectState,
  typeof historicHandlers,
  typeof ahistoricHandlers
>({
  handlers: {
    historic: historicHandlers,
    ahistoric: ahistoricHandlers,
  },
  initialState: projectInitialState,
})

export {projectActions, rootReducer}
