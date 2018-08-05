import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './AllInOnePanel.css'
import {val} from '$shared/DataVerse2/atom'
import Left from '$tl/ui/panels/AllInOnePanel/Left/Left'
import Bottom from './Bottom/Bottom'
import {
  getSelectedProject,
  getSelectedInternalTimeline,
  getSelectedTimelineInstance,
} from './selectors'
import Project from '$tl/Project/Project'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export type AllInOnePanelStuff = {
  project: undefined | Project
  internalTimeline: undefined | InternalTimeline
  timelineInstance: undefined | TimelineInstance
}

export default class AllInOnePanel extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const height = val(this.ui.atomP.historic.allInOnePanel.height)

          const project = getSelectedProject(this.ui)
          const internalTimeline = project
            ? getSelectedInternalTimeline(this.ui, project)
            : undefined
          const timelineInstance = internalTimeline
            ? getSelectedTimelineInstance(
                this.ui,
                project as $IntentionalAny,
                internalTimeline,
              )
            : undefined

          const allInOnePanelStuff: AllInOnePanelStuff = {
            project,
            internalTimeline,
            timelineInstance,
          } as $IntentionalAny

          // if (!selectedProject)
          // const project = projectsSingleton.atom.pointer.projects[selectedProject]
          return (
            <div {...classes('container')} style={{height: height + 'px'}}>
              <div {...classes('middle')}>
                <Left />
              </div>
              <div {...classes('bottom')}>
                <Bottom allInOnePanelStuff={allInOnePanelStuff} />
              </div>
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}
