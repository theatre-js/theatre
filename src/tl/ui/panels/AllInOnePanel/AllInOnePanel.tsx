import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './AllInOnePanel.css'
import {val} from '$shared/DataVerse2/atom'
import Left from '$tl/ui/panels/AllInOnePanel/Left/Left'
import Bottom, {bottomHeight} from './Bottom/Bottom'
import {getProjectTimelineAndInstance} from './selectors'
import Project from '$tl/Project/Project'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import Right from './Right/Right'
import createPointerContext from '$shared/utils/react/createPointerContext'
import TimeUI from '$tl/ui/panels/AllInOnePanel/TimeUI/TimeUI'
import ActiveModeProvider from '$shared/components/ActiveModeProvider/ActiveModeProvider'

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
    window.addEventListener('keydown', this._handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.reactToWindowResize)
    window.removeEventListener('keydown', this._handleKeyDown)
  }

  _handleKeyDown = (e: KeyboardEvent) => {
    if (e.target && (e.target as HTMLElement).tagName === 'INPUT') {
      return
    }

    if (e.key === ' ') {
      this.togglePlay()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  togglePlay() {
    const {timelineInstance} = getProjectTimelineAndInstance(this.ui)

    if (timelineInstance) {
      if (timelineInstance.playing) {
        timelineInstance.pause()
      } else {
        timelineInstance.play()
      }
    }
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

          const {
            project,
            timelineInstance,
            internalTimeline,
          } = getProjectTimelineAndInstance(this.ui)

          const width = val(stateP.windowWidth) - 40
          const height = fullHeightIncludingBottom - bottomHeight
          const leftWidth = width * leftWidthFraction
          const rightWidth = width * (1 - leftWidthFraction)

          const allInOnePanelStuff: IAllInOnePanelStuff = {
            project,
            internalTimeline,
            timelineInstance,
            width,
            height,
            leftWidth,
            rightWidth,
          }

          return (
            <Provider value={allInOnePanelStuff}>
              <ActiveModeProvider modes={['cmd', 'shift', 'c', 'd', 'h']}>
                <div
                  {...classes('container')}
                  style={{height: fullHeightIncludingBottom}}
                >
                  <TimeUI
                    internalTimeline={internalTimeline}
                    timelineInstance={timelineInstance}
                    height={height}
                    width={rightWidth}
                    left={leftWidth}
                  />
                  <div {...classes('middle')} style={{height}}>
                    <div {...classes('left')} style={{width: leftWidth}}>
                      <Left />
                    </div>
                    <div
                      {...classes('right')}
                      style={{
                        width: rightWidth,
                        height,
                      }}
                    >
                      <Right />
                    </div>
                  </div>
                  <div {...classes('bottom')}>
                    <Bottom />
                  </div>
                </div>
              </ActiveModeProvider>
            </Provider>
          )
        }}
      </PropsAsPointer>
    )
  }
}
