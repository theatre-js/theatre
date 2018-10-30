import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './FillStrip.css'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  TimeStuff,
  ITimeStuff,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import noop from '$shared/utils/noop'

const stripUnscaledWidth = 1000

const classes = resolveCss(css)
interface IProps {}

interface IState {
  dragging: boolean
  contextMenuOpen: boolean
  contextMenuCoords: {x: number; y: number}
}

export default class FillStrip extends UIComponent<IProps, IState> {
  propsBeforeDrag: IProps
  rangeWhenDragStart: {from: number; to: number}
  inRangeXToTime: (x: number, shouldClamp?: boolean | undefined) => number
  tempActionGroup: ITempActionGroup | undefined
  timeStuff: ITimeStuff
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      dragging: false,
      contextMenuOpen: false,
      contextMenuCoords: {x: 0, y: 0},
    }
  }

  render() {
    return (
      <TimeStuff>
        {timeStuffP => (
          <PropsAsPointer props={this.props} state={this.state}>
            {p => {
              this.timeStuff = val(timeStuffP)
              const range = val(
                this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
                  this.ui.atomP.historic,
                  val(timeStuffP.timelineTemplate).address,
                ),
              )

              if (!range) return null

              const viewportWidth = val(timeStuffP.viewportSpace.width)
              const timeToInRangeX = val(timeStuffP.inRangeSpace.timeToInRangeX)
              const dragging = val(p.state.dragging)

              let [fromX, toX] = [
                timeToInRangeX(range.from),
                timeToInRangeX(range.to),
              ]
              
              const invisible = toX < 0 || fromX > viewportWidth
              if (!invisible) {
                if (fromX < 0) fromX = 0
                if (toX > viewportWidth) toX = viewportWidth
              }
              const width = toX - fromX

              const contextMenuOpen = val(p.state.contextMenuOpen);
              return (
                <>
                  {contextMenuOpen && (
                    <HalfPieContextMenu
                      close={this._closeContextMenu}
                      centerPoint={{
                        top: this.state.contextMenuCoords.y,
                        left: this.state.contextMenuCoords.x,
                      }}
                      placement="left"
                      // renderInPortal={true}
                      items={[
                        {
                          label: 'Remove playback range',
                          cb: this._deleteLimit,
                        },
                        // {
                        //   label: 'Fit to viewport',
                        //   cb: this._fitToViewport,
                        // },
                        // {
                        //   label: 'Resor$t$',
                        //   cb: this._deleteLimit,
                        // },
                      ]
                    }
                    />
                  )}
                  <ActiveModeContext.Consumer>
                    {activeMode => {
                      const dIsDown = activeMode === MODES.d
                      return (
                        <DraggableArea
                          onDragStart={this.onDragStart}
                          onDragEnd={this.onDragEnd}
                          onDrag={this.onDrag}
                          lockCursorTo="ew-resize"
                        >
                          <div
                            {...classes(
                              'container',
                              invisible && 'invisible',
                              dIsDown && 'dIsDown',
                              dragging && 'dragging',
                              contextMenuOpen && 'contextMenuOpen'
                            )}
                            style={{
                              transform: `translateX(${fromX}px) scaleX(${width /
                                stripUnscaledWidth})`,
                            }}
                            onContextMenu={this._openContextMenu}
                            onClick={(dIsDown && this._deleteLimit) || noop}
                          />
                        </DraggableArea>
                      )
                    }}
                  </ActiveModeContext.Consumer>
                </>
              )
            }}
          </PropsAsPointer>
        )}
      </TimeStuff>
    )
  }

  onDragStart = () => {
    const timelineTemplate = this.timeStuff.timelineTemplate
    const range = val(
      this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
        this.ui.atomP.historic,
        timelineTemplate.address,
      ),
    )
    if (!range) {
      // shouldn't even happen
      return
    }

    this.inRangeXToTime = this.timeStuff.inRangeSpace.inRangeXToTime
    this.propsBeforeDrag = this.props
    this.rangeWhenDragStart = range
    this.tempActionGroup = this.ui.actions.historic.temp()
    this.setState({dragging: true})
  }

  onDrag = (dx: number) => {
    const timeDiff = this.inRangeXToTime(dx, false)

    const clampTime = this.timeStuff.timeSpace.clamp

    const [from, to] = [
      this.rangeWhenDragStart.from + timeDiff,
      this.rangeWhenDragStart.to + timeDiff,
    ].map(clampTime)

    this.ui._dispatch(
      this.tempActionGroup!.push(
        this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
          limit: {from, to},
          ...this.timeStuff.timelineTemplate.address,
        }),
      ),
    )
  }

  onDragEnd = (happened: boolean) => {
    this.setState({dragging: false})
    const tempActionGroup = this.tempActionGroup!
    this.ui._dispatch(
      happened ? tempActionGroup.commit() : tempActionGroup.discard(),
    )
    this.tempActionGroup = undefined
  }

  _openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      contextMenuOpen: true,
      contextMenuCoords: {x: e.clientX, y: e.clientY},
    })
  }

  _closeContextMenu = () => {
    this.setState({contextMenuOpen: false})
  }

  _deleteLimit = () => {
    this._closeContextMenu()
    this.ui._dispatch(
      this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
        limit: undefined,
        ...this.timeStuff.timelineTemplate.address,
      }),
      )
    }
    
    _fitToViewport = () => {
      const range = this.timeStuff.rangeAndDuration.range
      
      this._closeContextMenu()
  }
}
