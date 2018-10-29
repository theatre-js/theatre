import React from 'react'
import UIComponent from '$tl/ui/handy/UIComponent'
import Base from './Base'
import Handle from './Handle'
import FillStrip from '$tl/ui/panels/AllInOnePanel/TimeUI/PlaybackRange/FillStrip'

interface IProps {}

interface IState {}

export default class PlaybackRange extends UIComponent<IProps, IState> {
  render() {
    return (
      <>
        <Base />
        <FillStrip />
        <Handle which="from" />
        <Handle which="to" />
        {/* <Shadow which="to" />
        <Shadow which="from" /> */}
      </>
    )
  }
}
