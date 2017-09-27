// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from './studioContext'
import * as D from '$shared/DataVerse'

type Args = {
  modifyBaseDerivation: (D.DerivedMap<$FixMe>) => D.DerivedMap<$FixMe>,
  displayName?: string,
}

export default function makeReactiveComponent({modifyBaseDerivation, displayName}: Args) {
  type Props = {key: string, props: $FixMe} & WithStudioProps

  class TheaterJSComponent extends React.PureComponent<Props, void> {
    static displayName = displayName
    _finalFace: $FixMe
    _atom: $FixMe
    _baseDerivation: $FixMe
    // +modifyBaseDerivation: (D.DerivedMap) => D.DerivedMap
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

      props: (d) => d.prop('atom').map((atom) => atom.prop('_props')),
      studio: (d) => d.pointer().prop('atom').prop('studio'),
      key: (d) => d.pointer().prop('atom').prop('key'),
    }

    constructor(props: Props) {
      super(props)

      const instanceId = new D.BoxAtom(this.props.studio._getNewComponentInstanceId())
      this._atom = new D.MapAtom({instanceId, _props: (props.props: $FixMe), studio: props.studio, key: props.key})

      this._baseDerivation = new D.DerivedMap({
        atom: () => this._atom,
      }).extend(TheaterJSComponent._baseLookupTable)

      this._finalFace = modifyBaseDerivation(this._baseDerivation).face(props.studio.dataverseContext)

      this._fnsToCallOnDidUnmount = []
      this._whatToRender = null
      const untapFromRender = this._finalFace.prop('render').setDataVerseContext(props.studio.dataverseContext).changes().tap((whatToRender) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })
      this._fnsToCallOnDidUnmount.push(untapFromRender)
    }

    applyModifiers(derivation: $FixMe): $FixMe {
      return derivation
    }

    componentWillReceiveProps(newProps: Props) {
      if (newProps.props !== this.props.props) {
        this._atom.set('_props', newProps.props)
      }
    }

    componentWillMount() {
      this._whatToRender = this._finalFace.prop('render').getValue()
      // this._finalFace.prop('componentWillMountCallbacks').getValue().forEach((fn) => fn())
    }

    // componentDidMount() {
    //   this._finalFace.prop('componentDidMountCallbacks').getValue().forEach((fn) => fn())
    // }

    // componentWillUnmount() {
    //   this._finalFace.prop('componentWillUnmountCallbacks').getValue().forEach((fn) => fn())
    // }

    // componentDidUnmount() {
    //   this._fnsToCallOnDidUnmount.forEach((fn) => {fn()})

    //   this._finalFace.prop('componentDidUnmountCallbacks').getValue().forEach((fn) => fn())
    // }

    render() {
      return this._whatToRender
    }
  }

  return (compose(
    withStudio,
  )(TheaterJSComponent))
}