import * as React from 'react'
import PureComponentWithStudio from '$src/studio/componentModel/react/utils/PureComponentWithStudio'
import {reduceStateAction} from '$src/studio/common/actions'

/**
 * A superclass of almost all TheaterJS Studio components. Right now, it
 * doesn't do anything other than being a pure component, but we may add
 * features to it in the future, which will be available to all studio
 * components
 */
export default abstract class StudioComponent<
  Props,
  State
> extends PureComponentWithStudio<Props, State> {
  reduceState = (path: Array<string | number>, reducer: (s: any) => any) => {
    return this.dispatch(reduceStateAction(path, reducer))
  }

  dispatch = (action: mixed) => {
    this.studio.store.reduxStore.dispatch(action)
  }
}
