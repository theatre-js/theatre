import React from 'react'

type Props = {
  children: (dims: {width: number; height: number}) => React.ReactNode
}

type State = {
  dims: {width: number; height: number}
}

export default class WindowDims extends React.Component<Props, State> {
  state = {dims: getDims()}
  constructor(props: Props) {
    super(props)
  }

  componentDidMount() {
    window.addEventListener('resize', this.reactToResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.reactToResize)
  }

  reactToResize = () => {
    const dims = getDims()
    this.setState({dims})
  }

  render() {
    return this.props.children(this.state.dims)
  }
}

const getDims = () => ({width: window.innerWidth, height: window.innerHeight})
