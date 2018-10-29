import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Base.css'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import CursorLock from '$shared/components/CursorLock'
import {
  TimeStuff,
  ITimeStuff,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'

const classes = resolveCss(css)

interface IProps {}

interface IState {
  dragging: boolean
}

export default class Base extends UIComponent<IProps, IState> {
  timeStuff: ITimeStuff
  dragStartTime: number
  tempActionGroup: undefined | ITempActionGroup
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      dragging: false,
    }
  }

  render() {
    return (
      <TimeStuff>
        {timeStuffP => {
          return (
            <ActiveModeContext.Consumer>
              {activeMode => (
                <PropsAsPointer
                  props={this.props}
                  state={this.state}
                  activeMode={activeMode}
                >
                  {p => {
                    this.timeStuff = val(timeStuffP)
                    const shiftIsDown = val(p.activeMode) === MODES.shift
                    const dragging = val(p.state.dragging)
                    return (
                      <>
                        <CursorLock
                          cursor="ew-resize"
                          enabled={val(p.state.dragging)}
                        />
                        <DraggableArea
                          enabled={shiftIsDown}
                          onDragStart={this.onShiftDragStart}
                          onDrag={this.onShiftDrag}
                          onDragEnd={this.onShiftDragEnd}
                        >
                          <div
                            {...classes(
                              'container',
                              shiftIsDown && 'shiftIsDown',
                              dragging && 'dragging',
                            )}
                          />
                        </DraggableArea>
                      </>
                    )
                  }}
                </PropsAsPointer>
              )}
            </ActiveModeContext.Consumer>
          )
        }}
      </TimeStuff>
    )
  }

  onShiftDragStart = (e: React.MouseEvent) => {
    this.setState({dragging: true})
    const {layerX} = e.nativeEvent
    this.dragStartTime = this.timeStuff.inRangeSpace.inRangeXToTime(layerX)
    this.tempActionGroup = this.ui.actions.historic.temp()
  }

  onShiftDrag = (dx: number) => {
    const timeDiff = this.timeStuff.inRangeSpace.inRangeXToTime(dx, false)

    let [from, to] = (timeDiff >= 0
      ? [this.dragStartTime, this.dragStartTime + timeDiff]
      : [this.dragStartTime + timeDiff, this.dragStartTime]
    ).map(this.timeStuff.timeSpace.clamp)

    this.ui._dispatch(
      this.tempActionGroup!.push(
        this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
          limit: {from, to},
          ...this.timeStuff.timelineTemplate.address,
        }),
      ),
    )
  }

  onShiftDragEnd = (happened: boolean) => {
    this.setState({dragging: false})
    const tempActionGroup = this.tempActionGroup!
    this.ui._dispatch(
      happened ? tempActionGroup.commit() : tempActionGroup.discard(),
    )
    this.tempActionGroup = undefined
  }
}
