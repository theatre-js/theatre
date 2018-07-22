import React, {PureComponent} from 'react'
import noop from 'lodash/noop'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {tickerContextTypes, getTicker} from '$shared/utils/react/TickerContext'

interface Props {
  derivation: AbstractDerivation<React.ReactNode>
}

export default class DerivationAsReactElement extends PureComponent<Props, {}> {
  _untapFromDerivationChanges: () => void

  constructor(props: Props, context: $FixMe) {
    super(props, context)
    this._untapFromDerivationChanges = noop
    this.listen(this.props)
  }

  listen(props: Props) {
    const ticker = getTicker(this.context)
    if (!ticker) {
      throw new Error(
        `Can't find <TickerProvider> in the context.
        <DerivationAsReactElement> should be mounted as an ancestor of <TickerProvider>`,
      )
    }
    this._untapFromDerivationChanges = props.derivation
      .changes(ticker)
      .tap(() => {
        this.forceUpdate()
      })
  }

  componentWillUnmount() {
    this._untapFromDerivationChanges()
  }

  componentWillReceiveProps(newProps: Props) {
    this._untapFromDerivationChanges()
    this.listen(newProps)
    this.forceUpdate()
  }

  render() {
    return this.props.derivation.getValue()
  }

  static contextTypes = tickerContextTypes
}
