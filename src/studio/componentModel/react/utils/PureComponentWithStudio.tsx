import {contextTypes, contextName} from './studioContext'
import * as React from 'react'
import Studio from '$studio/bootstrap/Studio'
import {reduceStateAction} from '$shared/utils/redux/commonActions'

/**
 * The main reason I made this as a component instead of just providing a HOC called `withStudio()` is that
 * I don't want to make react devtools's tree view too messy for our end-users. It'll probably make them
 * feel uncomfortable if for every TheaterJS component they see a whole bunch of HOCs.
 */
export default class PureComponentWithStudio<
  Props,
  State
> extends React.PureComponent<Props, State> {
  studio: Studio

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.studio = context[contextName]
  }

  reduceState = (path: Array<string | number>, reducer: (s: any) => any) => {
    return this.dispatch(reduceStateAction(path, reducer))
  }

  dispatch = (action: mixed) => {
    this.studio.store.reduxStore.dispatch(action)
  }

  static contextTypes = contextTypes
}
