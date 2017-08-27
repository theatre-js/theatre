// @flow
import React from 'react'
import compose from 'ramda/src/compose'

type Subscription = {
  unsubscribe: () => void,
}

class ReactiveComponent<P, S = void> extends React.PureComponent<P, S> {
  constructor(props: P) {
    super(props)
    this._setupSubscriptions()
  }

  getSubscriptions: (p: P) => Array<Subscription>

  _setupSubscriptions() {

  }
}

export default compose(
  (a) => a,
)(ReactiveComponent)