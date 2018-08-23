import React from 'react'
import RootPropProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'

interface IProps {}

interface IState {}

class TimelineProviders extends React.PureComponent<IProps, IState> {
  render() {

    //SelectionProvider, OverlaysProvider
    return (
      <RootPropProvider>
        {this.props.children}
      </RootPropProvider>
    )
  }
}

export default TimelineProviders
