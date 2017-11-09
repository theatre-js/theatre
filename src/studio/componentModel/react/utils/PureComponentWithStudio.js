// @flow
import {contextTypes, contextName} from './studioContext'
import * as React from 'react'
import type {default as TheStudioClass} from '$studio/TheStudioClass'

/**
 * The main reason I made this as a component instead of just providing a HOC called `withStudio()` is that
 * I don't want to make react devtools's tree view too messy for our end-users. It'll probably make them
 * feel uncomfortable if for every TheaterJS component they see a whole bunch of HOCs.
 */
export default class PureComponentWithStudio<
  Props,
  State,
> extends React.PureComponent<Props, State> {
  studio: TheStudioClass

  constructor(props: Props, context: $FixMe) {
    super(props, context)
    this.studio = context[contextName]
  }
}

PureComponentWithStudio.contextTypes = contextTypes
