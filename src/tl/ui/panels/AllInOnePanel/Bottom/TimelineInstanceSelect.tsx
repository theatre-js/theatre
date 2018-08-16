import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {getTimelineInstances} from '../selectors'
import Item from './Item'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList'

interface IProps {
  allInOnePanelStuff: AllInOnePanelStuff
}

interface IState {
  menuOpen: boolean
}

export default class TimelineInstanceSelect extends UIComponent<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  render() {
    const {
      project,
      timelineInstance,
      internalTimeline,
    } = this.props.allInOnePanelStuff

    if (!project || !internalTimeline) return null

    return (
      <>
        {this.state.menuOpen && (
          <PropsAsPointer>
            {() => {
              const timelineInstances = getTimelineInstances(
                project,
                internalTimeline,
              )

              const onSelect = (instanceId: string) =>
                this.setInstance(project.id, internalTimeline._path, instanceId)

              return (
                <FlyoutSearchableList
                  options={Object.keys(timelineInstances)}
                  onSelect={onSelect}
                  close={this.closeMenu}
                />
              )
            }}
          </PropsAsPointer>
        )}
        <Item onClick={this.onClick}>
          {timelineInstance ? timelineInstance._instanceId : 'No instances'}
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

  setInstance = (
    projectId: string,
    internalTimelinePath: string,
    instanceId: string,
  ) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setActiveTimelineInstanceId({
        projectId,
        internalTimelinePath,
        instanceId,
      }),
    )
    this.closeMenu()
  }
}
