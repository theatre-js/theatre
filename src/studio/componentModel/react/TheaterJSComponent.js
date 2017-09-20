// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from './studioContext'
import * as D from '$shared/DataVerse'

type Props<ReactiveProps> = {reactiveProps: ReactiveProps, key: string} & WithStudioProps

/**
 * This is the abstract component that all other TheaterJS components are supposed to extend from.
 */
class TheaterJSComponent<ReactiveProps> extends React.PureComponent<Props<ReactiveProps>, void> {
  _finalDerivation: $FixMe
  _atom: $FixMe
  _baseDerivation: $FixMe
  modifyBaseDerivation: $FixMe
  _whatToRender: $FixMe
  _fnsToCallOnDidUnmount: Array<() => void>

  static _baseLookupTable = {
    render() {
      return null
    },
    componentWillMountCallbacks: () => new D.DerivedArray(),
    componentDidMountCallbacks: () => new D.DerivedArray(),
    componentWillUnmountCallbacks: () => new D.DerivedArray(),
    componentDidUnmountCallbacks: () => new D.DerivedArray(),
    componentWillUpdateCallbacks: () => new D.DerivedArray(),
  }

  constructor(props: Props<ReactiveProps>) {
    super(props)

    const instanceId = new D.BoxAtom(this.props.studio._getNewComponentInstanceId())
    this._atom = new D.MapAtom({instanceId, reactiveProps: (props.reactiveProps: $FixMe)})

    this._baseDerivation = new D.DerivedMap({
      atom: () => this._atom,
    }).extend(TheaterJSComponent._baseLookupTable)

    this._finalDerivation = this.modifyBaseDerivation(this._baseDerivation)

    this._fnsToCallOnDidUnmount = []
    this._whatToRender = null
    const untapFromRender = this._finalDerivation.prop('render').changes().tap((whatToRender) => {
      this._whatToRender = whatToRender
      this.forceUpdate()
    })
    this._fnsToCallOnDidUnmount.push(untapFromRender)
  }

  applyModifiers(derivation: $FixMe): $FixMe {
    return derivation
  }

  componentWillReceiveProps(newProps: Props<ReactiveProps>) {
    if (newProps.reactiveProps !== this.props.reactiveProps) {
      this._atom.set('reactiveProps', newProps.reactiveProps)
    }
  }

  componentWillMount() {
    this._finalDerivation.prop('componentWillMountCallbacks').forEach((fn) => fn())
  }

  componentDidMount() {
    this._finalDerivation.prop('componentDidMountCallbacks').forEach((fn) => fn())
  }

  componentWillUnmount() {
    this._finalDerivation.prop('componentWillUnmountCallbacks').forEach((fn) => fn())
  }

  componentDidUnmount() {
    this._fnsToCallOnDidUnmount.forEach((fn) => {fn()})

    this._finalDerivation.prop('componentDidUnmountCallbacks').forEach((fn) => fn())
  }

  render() {
    return this._whatToRender
  }
}

export default (compose(
  withStudio,
)(TheaterJSComponent): typeof TheaterJSComponent)