import React from 'react'
import RootPropProvider from '$tl/ui/panels/AllInOnePanel/Right/items/RootPropProvider'
import ItemsContainer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemsContainer'

interface IProps {}

interface IState {}

class TimelineProviders extends React.PureComponent<IProps, IState> {
  render() {

    {
      /*SelectionProvider, OverlaysProvider */
    }
    return (
      <RootPropProvider>
        <ItemsContainer />
      </RootPropProvider>
    )
  }
}

export default TimelineProviders
