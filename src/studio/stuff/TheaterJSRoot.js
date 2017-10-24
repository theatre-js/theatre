// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'

type Props = {
  children: React.Node,
}

type State = {}

class TheaterJSRoot extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      this.props.children
    )
  }
}

export default compose(
  (a) => a
)(TheaterJSRoot)