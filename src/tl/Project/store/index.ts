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
              valueContainer: {
                type: 'BezierCurvesOfScalarValues',
                points: [
                  {
                    time: 100,
                    value: 0,
                    interpolationDescriptor: {
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      connected: true,
                      handles: [0.5, 0, 0, 0.5],
                      interpolationType: 'CubicBezier',
                    },
                  },
                  {
                    time: 200,
                    value: 0.5,
                    interpolationDescriptor: {
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      connected: false,
                      handles: [0, 0, 0, 0],
                      interpolationType: 'CubicBezier',
                    },
                  },
                  {
                    time: 300,
                    value: 1,
                    interpolationDescriptor: {
                      __descriptorType: 'TimelinePointInterpolationDescriptor',
                      connected: false,
                      handles: [0, 0, 0, 0],
                      interpolationType: 'CubicBezier',
                    },
                  },
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
