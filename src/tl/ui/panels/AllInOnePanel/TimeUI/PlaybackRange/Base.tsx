import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Base.css'
import {coldVal} from '$shared/DataVerse/atom'
import {
  ActiveModeContext,
  MODES,
  IActiveMode,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import CursorLock from '$shared/components/CursorLock'
import {
  ITimeStuff,
  ITimeStuffP,
  TimeStuffContext,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import withContext from '$shared/utils/react/withContext'

const classes = resolveCss(css)

interface IProps {
  timeStuffP: ITimeStuffP
  activeMode: IActiveMode
}

interface IState {
  dragging: boolean
}

export default withContext({
  timeStuffP: TimeStuffContext,
  activeMode: ActiveModeContext,
})(
  class Base extends UIComponent<IProps, IState> {
    dragStartTime: number
    tempActionGroup: undefined | ITempActionGroup
    state = {dragging: false}
    timeStuff: ITimeStuff

    componentWillReceiveProps(newProps: IProps) {
      this.timeStuff = coldVal(newProps.timeStuffP)
    }

    render() {
      const shiftIsDown = this.props.activeMode === MODES.shift
      const {dragging} = this.state
      return (
        <>
          <CursorLock cursor="ew-resize" enabled={dragging} />
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
    }

    onShiftDragStart = (e: React.MouseEvent) => {
      this.setState({dragging: true})
      const {layerX} = e.nativeEvent
      this.dragStartTime = this.timeStuff.viewportScrolledSpace.inRangeXToTime(
        layerX,
      )
      this.tempActionGroup = this.ui.actions.historic.temp()
    }

    onShiftDrag = (dx: number) => {
      const timeDiff = this.timeStuff.viewportScrolledSpace.deltaXToDeltaTime(
        dx,
      )

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
  },
)
