import React from 'react'
import _ from 'lodash'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import PureComponentWithTheater from './PureComponentWithTheater'

interface Props {
  derivation: AbstractDerivation<React.ReactNode>
}

export default class DerivationAsReactElement extends PureComponentWithTheater<
  Props,
  {}
> {
  _untapFromDerivationChanges: () => void

  constructor(props: Props, context: $FixMe) {
    super(props, context)
    this._untapFromDerivationChanges = _.noop
    this.listen(this.props)
  }

  listen(props: Props) {
    this._untapFromDerivationChanges = props.derivation
      .changes(this.theater.ticker)
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
}
