import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {
  getTimelineInstances,
} from '../selectors'
import Item from './Item'
import FlyoutMenu from '$shared/components/FlyoutMenu/FlyoutMenu'
import FlyoutMenuItem from '$shared/components/FlyoutMenu/FlyoutMenuItem'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

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
          <FlyoutMenu onClose={this.closeMenu}>
            <PropsAsPointer>
              {() => {
                {
                  const timelineInstances = getTimelineInstances(
                    project,
                    internalTimeline,
                  )
                  return Object.keys(timelineInstances).map((instanceId, i) => {
                    return (
                      <FlyoutMenuItem
                        title={instanceId}
                        key={`instance#${i}`}
                        onClick={() =>
                          this.setInstance(
                            project.id,
                            internalTimeline._path,
                            instanceId,
                          )
                        }
                      />
                    )
                  })
                }
              }}
            </PropsAsPointer>
          </FlyoutMenu>
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
        instanceId
      }),
    )
  }
}
