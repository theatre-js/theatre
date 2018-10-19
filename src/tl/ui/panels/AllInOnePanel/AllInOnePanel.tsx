import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './AllInOnePanel.css'
import {val} from '$shared/DataVerse2/atom'
import Left from '$tl/ui/panels/AllInOnePanel/Left/Left'
import Bottom, {bottomHeight} from './Bottom/Bottom'
import {getProjectTimelineAndInstance} from './selectors'
import InternalProject from '$tl/Project/InternalProject'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import Right from './Right/Right'
import createPointerContext from '$shared/utils/react/createPointerContext'
import TimeUI from '$tl/ui/panels/AllInOnePanel/TimeUI/TimeUI'
import ActiveModeProvider from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {UIHistoricState} from '$tl/ui/store/types'
import PanelResizers from '$tl/ui/panels/AllInOnePanel/PanelResizers'
import clamp from '$shared/number/clamp'
import {cmdIsDown} from '$shared/utils/keyboardUtils'
import TimeStuffProvider from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'

const classes = resolveCss(css)

interface IProps {}

interface IState {
  windowWidth: number
  windowHeight: number
}

const {Provider, Consumer: AllInOnePanelStuff} = createPointerContext<
  IAllInOnePanelStuff
>()

export {AllInOnePanelStuff}

export type IAllInOnePanelStuff = {
  internalProject: undefined | InternalProject
  internalTimeline: undefined | InternalTimeline
  timelineInstance: undefined | TimelineInstance
  width: number
  height: number
  leftWidth: number
  rightWidth: number
}

export default class AllInOnePanel extends UIComponent<IProps, IState> {
  tempActionGroup = this.ui.actions.historic.temp()

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    }
  }

  render() {
    return (
      <PropsAsPointer props={this.props} state={this.state}>
        {({state: stateP}) => {
          const panelMargins = val(this.ui.atomP.historic.allInOnePanel.margins)
          const windowWidth = val(stateP.windowWidth)
          const windowHeight = val(stateP.windowHeight)

          const leftWidthFraction = val(
            this.ui.atomP.historic.allInOnePanel.leftWidthFraction,
          )

          const {
            internalProject,
            timelineInstance,
            internalTimeline,
          } = getProjectTimelineAndInstance(this.ui)

          if (
            internalProject &&
            !val(internalProject._selectors.ephemeral.isReady(internalProject.atomP.ephemeral))
          ) {
            return null
          }

          const fullHeightIncludingBottom =
            (1 - panelMargins.top - panelMargins.bottom) * windowHeight
          const width =
            (1 - panelMargins.left - panelMargins.right) * windowWidth
          const height = fullHeightIncludingBottom - bottomHeight
          const leftWidth = width * leftWidthFraction
          const rightWidth = width * (1 - leftWidthFraction)

          const allInOnePanelStuff: IAllInOnePanelStuff = {
            internalProject,
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
                  style={{
                    height: fullHeightIncludingBottom,
                    width,
                    left: panelMargins.left * windowWidth,
                    top: panelMargins.top * windowHeight,
                    // @ts-ignore
                    '--right-width': rightWidth,
                  }}
                >
                  <TimeStuffProvider>
                    <>
                      <TimeUI
                        internalTimeline={internalTimeline}
                        timelineInstance={timelineInstance}
                        height={height}
                        timelineWidth={rightWidth}
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
                    </>
                  </TimeStuffProvider>
                  <div {...classes('bottom')}>
                    <Bottom
                      handlePanelMove={this.handlePanelMove}
                      handlePanelMoveEnd={this.commitPanelMargins}
                    />
                  </div>
                  <PanelResizers
                    onResize={this.handlePanelResize}
                    onResizeEnd={this.commitPanelMargins}
                  />
                </div>
              </ActiveModeProvider>
            </Provider>
          )
        }}
      </PropsAsPointer>
    )
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
    } else if (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') {
      if (cmdIsDown(e)) {
        if (e.shiftKey === true) {
          this.internalProject._dispatch(this.internalProject._actions.historic.redo())
        } else {
          this.internalProject._dispatch(this.internalProject._actions.historic.undo())
        }
      } else if (e.altKey === true) {
        if (e.shiftKey === true) {
          this.ui._dispatch(this.ui.actions.historic.redo())
        } else {
          this.ui._dispatch(this.ui.actions.historic.undo())
        }
      }
    } else {
      return
    }

    e.preventDefault()
    e.stopPropagation()
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
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })
  }

  handlePanelMove = (dx: number, dy: number) => {
    dx = dx / this.state.windowWidth
    dy = dy / this.state.windowHeight
    const currentMargins = val(this.ui.atomP.historic.allInOnePanel.margins)
    const newMargins = {
      left: currentMargins.left + dx,
      top: currentMargins.top + dy,
      right: currentMargins.right - dx,
      bottom: currentMargins.bottom - dy,
    }

    // Avoid moving out of the viewport
    marginsKeys.forEach((key, index) => {
      if (newMargins[key] < 0) {
        const otherSideKey = marginsKeys[(index + 2) % 4]
        newMargins[key] = 0
        newMargins[otherSideKey] =
          currentMargins[key] + currentMargins[otherSideKey]
      }
    })

    this.updatePanelMarginsTemporarily(newMargins)
  }

  handlePanelResize = (marginsDeltas: Partial<TPanelMargins>) => {
    const {windowWidth, windowHeight} = this.state
    const currentMargins = val(this.ui.atomP.historic.allInOnePanel.margins)
    const newMargins = {
      left: clamp(
        currentMargins.left +
          (marginsDeltas.left ? marginsDeltas.left / windowWidth : 0),
        0,
        1,
      ),
      top: clamp(
        currentMargins.top +
          (marginsDeltas.top ? marginsDeltas.top / windowHeight : 0),
        0,
        1,
      ),
      right: clamp(
        currentMargins.right -
          (marginsDeltas.right ? marginsDeltas.right / windowWidth : 0),
        0,
        1,
      ),
      bottom: clamp(
        currentMargins.bottom -
          (marginsDeltas.bottom ? marginsDeltas.bottom / windowHeight : 0),
        0,
        1,
      ),
    }
    if (windowWidth * (1 - newMargins.left - newMargins.right) < 350) {
      if (marginsDeltas.left) {
        newMargins.left = 1 - currentMargins.right - 350 / windowWidth
        newMargins.right = currentMargins.right
      } else {
        newMargins.left = currentMargins.left
        newMargins.right = 1 - currentMargins.left - 350 / windowWidth
      }
    }
    this.updatePanelMarginsTemporarily(newMargins)
  }

  updatePanelMarginsTemporarily = (newMargins: TPanelMargins) => {
    this.ui.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.ui.actions.historic.setAllInOnePanelMargins({newMargins}),
      ),
    )
  }

  commitPanelMargins = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.batched([
        this.ui.actions.historic.setAllInOnePanelMargins({
          newMargins: val(this.ui.atomP.historic.allInOnePanel.margins),
        }),
        this.tempActionGroup.discard(),
      ]),
    )
  }
}

export type TPanelMargins = UIHistoricState['allInOnePanel']['margins']

const marginsKeys: Array<keyof TPanelMargins> = [
  'left',
  'top',
  'right',
  'bottom',
]
