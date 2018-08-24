import React from 'react'
import RootPropProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import OverlaysProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'

interface IProps {}

interface IState {}

class TimelineProviders extends React.PureComponent<IProps, IState> {
  render() {
    //SelectionProvider
    return (
      <OverlaysProvider>
        <RootPropProvider>{this.props.children}</RootPropProvider>
      </OverlaysProvider>
    )
  }
}

export default TimelineProviders
