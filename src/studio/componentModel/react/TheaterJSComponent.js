// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from './studioContext'
import * as D from '$shared/DataVerse'

type Props<WiredProps> = {wiredProps: WiredProps, key: string} & WithStudioProps

const emptyIterableArrayWire = new D.IterableArrayWire([])

const initialWireLookupTable = {
  componentWillMountHooks() {
    return emptyIterableArrayWire
  },
  componentWillUnmountHooks() {
    return emptyIterableArrayWire
  },
  componentDidMountHooks() {
    return emptyIterableArrayWire
  },
  componentDidUnmountHooks() {
    return emptyIterableArrayWire
  },
  render() {
    return null
  },
}

/**
 * This is the abstract component that all other TheaterJS components are supposed to extend from.
 */
class TheaterJSComponent<WiredProps> extends React.PureComponent<Props<WiredProps>, void> {
  _renderDerivative: *
  _unsubscribeTorenderDerivative: *
  +modifyInitialWire: (wire: $FixMe) => $FixMe
  getRenderDerivative: () => $FixMe
  _untapsOnUnmount: Array<() => void>
  _wire: *
  _initialWire: *
  _instanceId: number

  constructor(...args: $IntentionalAny) {
    super(...args)
    this._instanceId = this.props.studio._getNewComponentInstanceId()

    this._initialWire = new D.NonIterableMapWire(initialWireLookupTable).extend({componentInstance: this})
    this._wire = this.modifyInitialWire(this._initialWire)

    this.props.studio.registerComponentInstance(this._instanceId, this)

    this._untapsOnUnmount = []
  }

  componentWillMount() {
    this._untapsOnUnmount.push(
      this._wire.get('render').tap(() => {
        this.forceUpdate()
      })
    )

    this._wire.get('componentWillMountHooks').forEach((fn) => {fn.call(this)})
  }

  componentDidMount() {
    this._wire.get('componentDidMountHooks').forEach((fn) => {fn.call(this)})
  }

  componentWillUnmount() {
    this._wire.get('componentWillUnmountHooks').forEach((fn) => {fn.call(this)})
  }

  componentDidUnmount() {
    this._wire.get('componentDidUnmountHooks').forEach((fn) => {fn.call(this)})
    this._untapsOnUnmount.forEach((fn) => {fn()})
    this.props.studio.unregisterComponentInstance(this._instanceId)
  }

  render() {
    return this._wire.get('render').currentValue
  }
}

export default (compose(
  withStudio,
)(TheaterJSComponent): typeof TheaterJSComponent)