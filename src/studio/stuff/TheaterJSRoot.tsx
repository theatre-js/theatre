import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {}

class TheaterJSRoot extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return this.props.children
  }
}

export default TheaterJSRoot
