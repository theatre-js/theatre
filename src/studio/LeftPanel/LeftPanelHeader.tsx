import React from 'react'
import * as css from './LeftPanelHeader.css'
import ExploreFlyoutMenu from '$studio/ExploreFlyoutMenu/ExploreFlyoutMenu'
import PanelTab from '$studio/workspace/components/Panel/PanelTab'
import SvgIcon from '$shared/components/SvgIcon'
import ExploreIcon from 'svg-inline-loader!./ExploreIcon.svg'

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
        <PanelTab
          onClick={this._toggleExplore}
          css={{container: css.exploreTab}}
          isCurrent={false}
        >
          <SvgIcon src={ExploreIcon} css={{container: css.exploreIcon}} />
        </PanelTab>
        <PanelTab isCurrent={true}>Component</PanelTab>
        <ExploreFlyoutMenu
          isOpen={this.state.exploreIsOpen}
          close={this._closeExplore}
        />
      </div>
    )
  }
}
