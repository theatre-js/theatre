// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from './studioContext'

/**
 * This is the abstract component that all other TheaterJS components are supposed to extend from.
 */
class TheaterJSComponent<Props, State> extends React.PureComponent<Props & WithStudioProps, State> {
  _renderDerivative: *
  _unsubscribeTorenderDerivative: *
  getRenderDerivative: () => $FixMe

  constructor(...args: $IntentionalAny) {
    super(...args)

    this._renderDerivative = this.getRenderDerivative()
    this._unsubscribeTorenderDerivative = this._renderDerivative.subscribe(() => {
      this.forceUpdate()
    })
  }

  componentWillUnmount() {
    this._unsubscribeTorenderDerivative()
  }

  /**
   * render() is already provided, but you should instead provide getRdenderDerivative()
   */
  render() {
    return this._renderDerivative.getReference()
  }
}

export default compose(
  withStudio,
)(TheaterJSComponent)