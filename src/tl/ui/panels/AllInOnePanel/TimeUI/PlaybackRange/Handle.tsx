import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Handle.css'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  TimeStuff,
  ITimeStuff,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'

const classes = resolveCss(css)
interface IProps {
  which: 'from' | 'to'
}

interface IState {}

export default class Handle extends UIComponent<IProps, IState> {
  propsBeforeDrag: IProps
  rangeWhenDragStart: {from: number; to: number}
  deltaXToDeltaTime: (x: number, shouldClamp?: boolean | undefined) => number
  tempActionGroup: ITempActionGroup | undefined
  timeStuff: ITimeStuff
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <TimeStuff>
        {timeStuffP => (
          <PropsAsPointer props={this.props}>
            {p => {
              this.timeStuff = val(timeStuffP)
              const range = val(
                this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
                  this.ui.atomP.historic,
                  val(timeStuffP.timelineTemplate).address,
                ),
              )

              if (!range) return null
              const which = val(p.props.which)
              const time = range[which]
              const viewportWidth = val(timeStuffP.viewportSpace.width)
              const timeToInRangeX = val(timeStuffP.viewportScrolledSpace.timeToInRangeX)

              const x = timeToInRangeX(time)

              const invisible = x < 0 || x > viewportWidth

              return (
                <DraggableArea
                  onDragStart={this.onDragStart}
                  onDragEnd={this.onDragEnd}
                  onDrag={this.onDrag}
                  lockCursorTo={which === 'from' ? 'w-resize' : 'e-resize'}
                >
                  <div
                    {...classes('container', which, invisible && 'invisible')}
                    style={{
                      transform: `translateX(${x}px)`,
                    }}
                  />
                </DraggableArea>
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

    this.deltaXToDeltaTime = this.timeStuff.viewportScrolledSpace.deltaXToDeltaTime
    this.propsBeforeDrag = this.props
    this.rangeWhenDragStart = range
    this.tempActionGroup = this.ui.actions.historic.temp()
  }

  onDrag = (dx: number) => {
    const timeDiff = this.deltaXToDeltaTime(dx, false)

    const which = this.propsBeforeDrag.which
    const timeOfThisHandle = this.rangeWhenDragStart[which] + timeDiff
    const timeOfOtherHandle = this.rangeWhenDragStart[
      which === 'from' ? 'to' : 'from'
    ]

    const clampTime = this.timeStuff.timeSpace.clamp

    const [from, to] = (timeOfThisHandle < timeOfOtherHandle
      ? [timeOfThisHandle, timeOfOtherHandle]
      : [timeOfOtherHandle, timeOfThisHandle]
    ).map(clampTime)

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
}
