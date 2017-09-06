// @flow
import {type HigherOrderComponent} from 'react-flow-types'
import * as React from 'react'

type Subscription = () => void

const withSubscriptions = (getSubscriptions: (p: {}) => Array<Subscription>): $IntentionalAny => (OriginalComponent: React.ComponentType<*>): $FixMe => {
  class FinalComponent extends React.PureComponent<any> {
    // $FixMe
    static displayName = `withSubscriptions(${OriginalComponent.displayName || OriginalComponent.name || 'Component'})`
    _subscriptions: Array<Subscription>
    _getSubscriptions: typeof getSubscriptions

    constructor(props: any) {
      super(props)
      this._subscriptions = []
      this._getSubscriptions = getSubscriptions
    }

    _unsubscribeAll() {
      this._subscriptions.forEach((s) => s())
      this._subscriptions = []
    }

    componentWillMount() {
      this._subscribe()
    }

    _subscribe(props: any) {
      this._subscriptions = getSubscriptions(props)
    }

    componentWillReceiveProps(newProps) {
      this._unsubscribeAll()
      this._subscribe(newProps)
    }

    componentWillUnmount() {
      this._unsubscribeAll()
    }

    render() {
      return <OriginalComponent {...this.props} />
    }
  }

  return FinalComponent
}

export default ((withSubscriptions: $IntentionalAny): (getSubscriptions: (p: $IntentionalAny) => Array<Subscription>) => HigherOrderComponent<{}, {}>)