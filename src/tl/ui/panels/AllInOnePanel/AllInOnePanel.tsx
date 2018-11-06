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
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
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
import UI from '$tl/ui/UI'
import KeyboardShortcuts from '$tl/ui/panels/AllInOnePanel/KeyboardShortcuts'
import BlockNonChrome from '$tl/ui/panels/AllInOnePanel/BlockNonChrome'

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
  project: undefined | Project
  timelineTemplate: undefined | TimelineTemplate
  timelineInstance: undefined | TimelineInstance
  width: number
  heightMinusBottom: number
  leftWidth: number
  rightWidth: number
  ui: UI
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
    const ui = this.ui
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
            project,
            timelineInstance,
            timelineTemplate,
          } = getProjectTimelineAndInstance(this.ui)

          if ($env.NODE_ENV === 'development') {
            // @ts-ignore ignore
            window.project = project
            // @ts-ignore ignore
            window.timelineInstance = timelineInstance
            // @ts-ignore ignore
            window.timelineTemplate = timelineTemplate
          }

          if (
            project &&
            !val(project._selectors.ephemeral.isReady(project.atomP.ephemeral))
          ) {
            return null
          }

          const fullHeightIncludingBottom =
            (1 - panelMargins.top - panelMargins.bottom) * windowHeight
          const width =
            (1 - panelMargins.left - panelMargins.right) * windowWidth
          const heightMinusBottom = fullHeightIncludingBottom - bottomHeight
          const leftWidth = width * leftWidthFraction
          const rightWidth = width * (1 - leftWidthFraction)

          const allInOnePanelStuff: IAllInOnePanelStuff = {
            project,
            timelineTemplate,
            timelineInstance,
            width,
            heightMinusBottom,
            leftWidth,
            rightWidth,
            ui,
          }

          return (
            <Provider value={allInOnePanelStuff}>
              <ActiveModeProvider modes={['super', 'shift', 'c', 'd', 'h']}>
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
                  <BlockNonChrome>
                    <TimeStuffProvider>
                      <>
                        <KeyboardShortcuts />
                        <TimeUI
                          timelineTemplate={timelineTemplate}
                          timelineInstance={timelineInstance}
                          height={heightMinusBottom}
                          left={leftWidth}
                        />
                        <div
                          {...classes('middle')}
                          style={{height: heightMinusBottom}}
                        >
                          <div {...classes('left')} style={{width: leftWidth}}>
                            <Left />
                          </div>
                          <div
                            {...classes('right')}
                            style={{
                              width: rightWidth,
                              height: heightMinusBottom,
                            }}
                          >
                            <Right />
                          </div>
                        </div>
                      </>
                    </TimeStuffProvider>
                  </BlockNonChrome>
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

    if (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') {
      if (cmdIsDown(e)) {
        if (e.shiftKey === true) {
          this.project._dispatch(this.project._actions.historic.redo())
        } else {
          this.project._dispatch(this.project._actions.historic.undo())
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
