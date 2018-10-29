import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './DurationIndicator.css'
import {val, coldVal} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {timeToX} from '$theater/AnimationTimelinePanel/utils'
import {
  TimeStuff,
  IRangeAndDurationLock,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import CursorLock from '$shared/components/CursorLock'
import {roundestNumberBetween} from '$shared/utils/numberRoundingUtils'

interface IProps {
  css?: Partial<typeof css>
}

interface IState {
  dragging: boolean
}

const unscaledDimmerWidth = 1000

export default class DurationIndicator extends UIComponent<IProps, IState> {
  realDurationAtStartOfDrag: number
  timeStuffRef = TimeStuff.ref()
  rangeAtStartOfDrag: TRange
  dragActionGroup: ITempActionGroup
  rangeAndDurationLock: IRangeAndDurationLock
  // timeStuffRef = React.createRef<InstanceType<typeof TimeStuff>>()
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {dragging: false}
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <TimeStuff ref={this.timeStuffRef}>
        {rightStuffP => (
          <PropsAsPointer state={this.state}>
            {({state: stateP}) => {
              const timelineWidth = val(rightStuffP.scrollSpace.width)

              const dragging = val(stateP.dragging)
              const rangeAndDurationP = dragging
                ? rightStuffP.unlockedRangeAndDuration
                : rightStuffP.rangeAndDuration

              const realDuration = val(rangeAndDurationP.realDuration)

              const dimmerX = timeToX(
                val(rightStuffP.rangeAndDuration.overshotDuration),
                timelineWidth,
              )(realDuration)

              const dimmerWidth = timelineWidth - dimmerX -1

              return (
                <div {...classes('container', dragging && 'dragging')}>
                  <div
                    {...classes('dimmer')}
                    style={{
                      transform: `scale(${dimmerWidth /
                        unscaledDimmerWidth}, 1)`,
                    }}
                  />
                  <CursorLock cursor="ew-resize" enabled={dragging} />
                  <DraggableArea
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                    onDrag={this.onDrag}
                  >
                    <div
                      {...classes('border', dragging && 'dragging')}
                      style={{transform: `translateX(-${dimmerWidth}px)`}}
                    />
                  </DraggableArea>
                </div>
              )
            }}
          </PropsAsPointer>
        )}
      </TimeStuff>
    )
  }

  onDragStart = () => {
    this.realDurationAtStartOfDrag = coldVal(
      this.timeStuffRef.current!.values.rangeAndDuration.realDuration,
    )
    this.rangeAtStartOfDrag = coldVal(
      this.timeStuffRef.current!.values.rangeAndDuration.range,
    )
    this.dragActionGroup = this.project._actions.historic.temp()
    this.setState({dragging: true})
    this.rangeAndDurationLock = coldVal(
      this.timeStuffRef.current!.values.lockRangeAndDuration,
    )(coldVal(this.timeStuffRef.current!.values.rangeAndDuration))
  }

  onDragEnd = (dragHappened: boolean) => {
    if (dragHappened) {
      this.project._dispatch(this.dragActionGroup.commit())
    } else {
      this.project._dispatch(this.dragActionGroup.discard())
    }
    this.setState({dragging: false})

    this.rangeAndDurationLock.unlock()
  }

  onDrag = (dx: number) => {
    const timeStuff = this.timeStuffRef.current!.values
    const xToTime = coldVal(timeStuff.scrollSpace.xToTime)

    const minX = dx - 0.49999
    const maxX = dx + 0.49999

    const minTimeDiff = xToTime(minX)
    const maxTimeDiff = xToTime(maxX)
    const minNewDuration = this.realDurationAtStartOfDrag + minTimeDiff
    const maxNewDuration = this.realDurationAtStartOfDrag + maxTimeDiff
    const humanReadableDuration = roundestNumberBetween(
      minNewDuration,
      maxNewDuration,
    )

    const newDuration = humanReadableDuration

    const timelineAddress = coldVal(
      this.timeStuffRef.current!.values.timelineTemplate,
    ).address

    this.project._dispatch(
      this.dragActionGroup.push(
        this.project._actions.historic.setTimelineDuration({
          duration: newDuration,
          ...timelineAddress,
        }),
      ),
    )
  }
}
