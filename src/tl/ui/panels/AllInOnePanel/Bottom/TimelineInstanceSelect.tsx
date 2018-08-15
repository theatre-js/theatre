import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {getTimelineInstances} from '../selectors'
import Item from './Item'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import FlyoutMenu from '$shared/components/FlyoutMenu/FlyoutMenu'
import FlyoutMenuItem from '$shared/components/FlyoutMenu/FlyoutMenuItem'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList'
import {val} from '$shared/DataVerse2/atom'

interface IProps {}

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
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer state={this.state}>
            {({state: stateP}) => {
              const project = val(stuffP.project)
              const internalTimeline = val(stuffP.internalTimeline)
              if (!project || !internalTimeline) return null

              const timelineInstance = val(stuffP.timelineInstance)

              const onSelect = (instanceId: string) =>
                this.setInstance(project.id, internalTimeline._path, instanceId)

              const timelineInstances = getTimelineInstances(
                project,
                internalTimeline,
              )

              return (
                <>
                  {val(stateP.menuOpen) && (
                    <FlyoutSearchableList
                      options={Object.keys(timelineInstances)}
                      onSelect={onSelect}
                      close={this.closeMenu}
                    />
                  )}
                  <Item onClick={this.onClick}>
                    {timelineInstance
                      ? timelineInstance._instanceId
                      : 'No instances'}
                  </Item>
                </>
              )
            }}
          </PropsAsPointer>
        )}
      </AllInOnePanelStuff>
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
