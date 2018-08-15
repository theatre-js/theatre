import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './AllInOnePanel.css'
import {val} from '$shared/DataVerse2/atom'
import Left from '$tl/ui/panels/AllInOnePanel/Left/Left'
import Bottom, {bottomHeight} from './Bottom/Bottom'
import {
  getSelectedProject,
  getSelectedInternalTimeline,
  getSelectedTimelineInstance,
} from './selectors'
import Project from '$tl/Project/Project'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import Right from './Right/Right'
import createPointerContext from '$shared/utils/react/createPointerContext'

const classes = resolveCss(css)

interface IProps {}

interface IState {
  windowWidth: number
}

const {Provider, Consumer: AllInOnePanelStuff} = createPointerContext<
  IAllInOnePanelStuff
>()

export {AllInOnePanelStuff}

export type IAllInOnePanelStuff = {
  project: undefined | Project
  internalTimeline: undefined | InternalTimeline
  timelineInstance: undefined | TimelineInstance
  width: number
  height: number
  leftWidth: number
  rightWidth: number
}

export default class AllInOnePanel extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {windowWidth: window.innerWidth}
  }

  componentWillMount() {
    window.addEventListener('resize', this.reactToWindowResize)
  }

  reactToWindowResize = () => {
    this.setState({windowWidth: window.innerWidth})
  }

  render() {
    return (
      <PropsAsPointer props={this.props} state={this.state}>
        {({state: stateP}) => {
          const fullHeightIncludingBottom = val(
            this.ui.atomP.historic.allInOnePanel.height,
          )

          const leftWidthFraction = val(
            this.ui.atomP.historic.allInOnePanel.leftWidthFraction,
          )

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

          const width = val(stateP.windowWidth)

          const allInOnePanelStuff: IAllInOnePanelStuff = {
            project,
            internalTimeline,
            timelineInstance,
            width,
            height: fullHeightIncludingBottom - bottomHeight,
            leftWidth: width * leftWidthFraction,
            rightWidth: width * (1 - leftWidthFraction),
          }

          return (
            <Provider value={allInOnePanelStuff}>
              <div
                {...classes('container')}
                style={{height: fullHeightIncludingBottom + 'px'}}
              >
                <div
                  {...classes('middle')}
                  style={{height: allInOnePanelStuff.height + 'px'}}
                >
                  <div
                    {...classes('left')}
                    style={{width: allInOnePanelStuff.leftWidth + 'px'}}
                  >
                    <Left />
                  </div>
                  <div
                    {...classes('right')}
                    style={{width: allInOnePanelStuff.rightWidth + 'px'}}
                  >
                    <Right />
                  </div>
                </div>
                <div {...classes('bottom')}>
                  <Bottom />
                </div>
              </div>
            </Provider>
          )
        }}
      </PropsAsPointer>
    )
  }
}
