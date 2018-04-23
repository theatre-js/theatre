import React from 'react'
import * as css from './LeftPanelHeader.css'
import ExploreFlyoutMenu from '$studio/ExploreFlyoutMenu/ExploreFlyoutMenu'

type IProps = {}

interface IState {
  exploreIsOpen: boolean
}

export default class LeftPanelHeader extends React.PureComponent<
  IProps,
  IState
> {
  state = {exploreIsOpen: false}
  _openExplore = () => this.setState(() => ({exploreIsOpen: true}))
  _closeExplore = () => this.setState(() => ({exploreIsOpen: false}))
  _toggleExplore = () => this.setState(s => ({exploreIsOpen: !s.exploreIsOpen}))

  render() {
    return (
      <div className={css.container}>
        <div className={css.flyoutTrigger} onClick={this._toggleExplore}>
          Explore
        </div>
        <div className={css.title}>Left Panel</div>
        <ExploreFlyoutMenu isOpen={this.state.exploreIsOpen} />
      </div>
    )
  }
}
