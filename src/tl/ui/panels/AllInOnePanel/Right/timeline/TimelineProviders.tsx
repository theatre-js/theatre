import React from 'react'
import RootPropProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import OverlaysProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'
import SelectionProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'

interface IProps {}
interface IState {}

class TimelineProviders extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <SelectionProvider>
        <OverlaysProvider>
          <RootPropProvider>{this.props.children}</RootPropProvider>
        </OverlaysProvider>
      </SelectionProvider>
    )
  }
}

export default TimelineProviders
