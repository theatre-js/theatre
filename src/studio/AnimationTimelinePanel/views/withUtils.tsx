import React from 'react'
import {Subscriber} from 'react-broadcast'
import {
  VariablesPropGetterChannel,
  TPropGetter,
} from '$studio/AnimationTimelinePanel/variables/VariablesPropProvider'
import {SelectionAPIChannel} from '$studio/AnimationTimelinePanel/selection/SelectionProvider'
import {OverlaysAPIChannel} from '$studio/AnimationTimelinePanel/overlays/OverlaysProvider'
import {TSelectionAPI} from '$studio/AnimationTimelinePanel/selection/types'
import {TOverlaysAPI} from '$studio/AnimationTimelinePanel/overlays/types'

export interface IWithUtilsProps {
  propGetter: TPropGetter
  selectionAPI: TSelectionAPI
  overlaysAPI: TOverlaysAPI
}

export default <P extends {}>(
  Component: React.ComponentType<P & IWithUtilsProps>,
) => (props: P) => (
  <Subscriber channel={VariablesPropGetterChannel}>
    {(propGetter: TPropGetter) => (
      <Subscriber channel={SelectionAPIChannel}>
        {(selectoinAPI: TSelectionAPI) => (
          <Subscriber channel={OverlaysAPIChannel}>
            {(overlaysAPI: TOverlaysAPI) => (
              <Component
                {...props}
                propGetter={propGetter}
                selectionAPI={selectoinAPI}
                overlaysAPI={overlaysAPI}
              />
            )}
          </Subscriber>
        )}
      </Subscriber>
    )}
  </Subscriber>
)
