import {UIState} from './types'

export const uiInitialState: UIState = {
  ahistoric: {
    uiHidden: false,
    theTrigger: {
      position: {
        closestCorner: 'topLeft',
        distanceFromHorizontalEdge: 0.02,
        distanceFromVerticalEdge: 0.02,
      },
    },
  },
  historic: {},
  ephemeral: {},
}
