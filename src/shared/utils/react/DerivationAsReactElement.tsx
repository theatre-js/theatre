import React, {PureComponent} from 'react'
import noop from 'lodash/noop'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

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
    this._untapFromDerivationChanges = props.derivation
      .changesWithoutValues()
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
