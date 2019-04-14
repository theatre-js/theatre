import React from 'react'
import RootPropProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import OverlaysProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'
import SelectionProvider from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import DurationIndicator from '$tl/ui/panels/AllInOnePanel/Right/timeline/DurationIndicator'

interface IProps {
  enableZoom: () => void
  disableZoom: () => void
}
interface IState {}

class TimelineProviders extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <SelectionProvider
        disableZoom={this.props.disableZoom}
        enableZoom={this.props.enableZoom}
      >
        <OverlaysProvider>
          <DurationIndicator />
          <RootPropProvider>{this.props.children}</RootPropProvider>
        </OverlaysProvider>
      </SelectionProvider>
    )
  }
}

export default TimelineProviders
