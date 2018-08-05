import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import Item from './Item'
import FlyoutMenu from '$shared/components/FlyoutMenu/FlyoutMenu'
import FlyoutMenuItem from '$shared/components/FlyoutMenu/FlyoutMenuItem'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import InternalTimeline from '$tl/timelines/InternalTimeline'

interface IProps {
  allInOnePanelStuff: AllInOnePanelStuff
}

interface IState {
  menuOpen: boolean
}

export default class TimelineSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  render() {
    const {props} = this

    const project = props.allInOnePanelStuff.project
    if (!project) return null

    const internalTimeline = props.allInOnePanelStuff
      .internalTimeline as InternalTimeline

    return (
      <>
        {this.state.menuOpen && (
          <FlyoutMenu onClose={this.closeMenu}>
            <PropsAsPointer>
              {() => {
                const internalTimelines = val(
                  project._internalTimelines.pointer,
                )
                return Object.keys(internalTimelines).map((timelinePath, i) => {
                  return (
                    <FlyoutMenuItem
                      title={timelinePath}
                      key={`project#${i}`}
                      onClick={() =>
                        this.selectInternalTimeline(project.id, timelinePath)
                      }
                    />
                  )
                })
              }}
            </PropsAsPointer>
          </FlyoutMenu>
        )}
        <Item onClick={this.onClick}>
          {!internalTimeline ? 'No timelines yet' : internalTimeline._path}
        </Item>
      </>
    )
  }

  onClick = () => {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  closeMenu = () => {
    this.setState({menuOpen: false})
  }

  selectInternalTimeline = (
    projectId: string,
    internalTimelinePath: string,
  ) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setSelectedTimeline({
        projectId,
        internalTimelinePath,
      }),
    )
  }
}
