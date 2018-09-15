import React from 'react'
import noop from '$shared/utils/noop'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {tickerContextTypes, getTicker} from '$shared/utils/react/TickerContext'
import Ticker from '$shared/DataVerse/Ticker'

interface Props {
  derivation: AbstractDerivation<React.ReactNode>
}

export default class DerivationAsReactElement extends React.Component<
  Props,
  {}
> {
  _untapFromDerivationChanges: () => void
  updateQueeud: boolean = false
  ticker: Ticker
  willUnmount = false

  constructor(props: Props, context: $FixMe) {
    super(props, context)
    this._untapFromDerivationChanges = noop
    this.listen(this.props)
    this.ticker = getTicker(context)
  }

  listen(props: Props) {
    this._untapFromDerivationChanges = props.derivation
      .changesWithoutValues()
      .tap(() => {
        this._enqueueUpdate()
      })
  }

  private _enqueueUpdate = () => {
    if (this.updateQueeud || this.willUnmount) return
    this.updateQueeud = true
    this.ticker.registerSideEffect(this._doUpdate)
  }

  private _doUpdate = () => {
    if (this.willUnmount) return
    this.updateQueeud = false
    this.forceUpdate()
  }

  componentWillUnmount() {
    this.willUnmount = true
    this.ticker.unregisterSideEffect(this._doUpdate)
    this._untapFromDerivationChanges()
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.derivation === this.props.derivation) return
    this._untapFromDerivationChanges()
    this.listen(newProps)
  }

  render() {
    return this.props.derivation.getValue()
  }

  static contextTypes = tickerContextTypes
}
