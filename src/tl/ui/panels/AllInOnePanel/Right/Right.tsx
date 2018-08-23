import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {RangeState} from '$tl/timelines/InternalTimeline'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import {
  xToInRangeTime,
  deltaXToInRangeTime,
  getSvgWidth,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {
  getNewRange,
  getNewZoom,
  clampTime,
} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import TimelineProviders from '$tl/ui/panels/AllInOnePanel/Right/timeline/TimelineProviders'
import ItemsContainer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemsContainer'

const classes = resolveCss(css)

interface IExportedComponentProps {}

interface IRightProps {
  range: RangeState['rangeShownInPanel']
  duration: RangeState['duration']
  // currentTime: number
  width: number
  timelineInstance: TimelineInstance
  setRange: (range: RangeState['rangeShownInPanel']) => void
}

interface IRightState {}

class Right extends UIComponent<IRightProps, IRightState> {
  wrapper: React.RefObject<HTMLDivElement> = React.createRef()
  wrapperLeft: number

  constructor(props: IRightProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {range, duration, width} = this.props
    const svgWidth = getSvgWidth(range, duration, width)
    return (
      <DraggableArea
        onDragStart={this.syncSeekerWithMousePosition}
        onDrag={this.seekTime}
        shouldReturnMovement={true}
      >
        <div
          ref={this.wrapper}
          {...classes('wrapper')}
          onWheel={this.handleWheel}
        >
          <div style={{width: svgWidth}} {...classes('scrollingContainer')}>
            <TimelineProviders>
              <ItemsContainer />
            </TimelineProviders>
          </div>
        </div>
      </DraggableArea>
    )
  }

  componentDidMount() {
    this.wrapperLeft = this.wrapper.current!.getBoundingClientRect().left
  }

  syncSeekerWithMousePosition = (event: React.MouseEvent<HTMLDivElement>) => {
    const {width, range, timelineInstance} = this.props
    const newTime = xToInRangeTime(range, width)(
      event.clientX - this.wrapperLeft,
    )
    timelineInstance.gotoTime(newTime)
    // if (timelineInstance.playing) {
    //   timelineInstance.pause()
    //   timelineInstance.gotoTime(newTime)
    //   timelineInstance.play()
    // } else {
    //   timelineInstance.gotoTime(newTime)
    //   // addGlobalSeekerDragRule()
    // }
  }

  seekTime = (_: number, __: number, event: MouseEvent) => {
    const {range, width, timelineInstance} = this.props
    const newTime = xToInRangeTime(range, width)(
      event.clientX - this.wrapperLeft,
    )
    timelineInstance.gotoTime(clampTime(range, newTime))
  }

  handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // horizontal scroll
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault()
      event.stopPropagation()
      const {range, width, duration} = this.props
      const dt = deltaXToInRangeTime(range, width)(event.deltaX)

      const change = {from: dt, to: dt}
      this._setRange(getNewRange(range, change, duration))
      return
    }

    // pinch
    if (event.ctrlKey) {
      event.preventDefault()
      event.stopPropagation()
      const {range, duration, width} = this.props
      const dt = deltaXToInRangeTime(range, width)(event.deltaY) * 9.5
      const fraction = (event.clientX - this.wrapperLeft) / width

      const change = {from: -dt * fraction, to: dt * (1 - fraction)}
      this._setRange(getNewZoom(range, change, duration))
    }
  }

  _setRange(range: RangeState['rangeShownInPanel']) {
    this.props.setRange(range)
    this._scrollContainer()
  }

  _scrollContainer() {
    const {range, width} = this.props
    const scrollLeft = (width * range.from) / (range.to - range.from)

    this.wrapper.current!.scrollTo({left: scrollLeft})
  }
}

export default (_props: IExportedComponentProps) => (
  <AllInOnePanelStuff>
    {allInOnePanelStuffP => (
      <PropsAsPointer>
        {() => {
          const timelineInstance = val(allInOnePanelStuffP.timelineInstance)
          const internalTimeline = val(allInOnePanelStuffP.internalTimeline)
          if (!timelineInstance || !internalTimeline) return null

          const rangeState = val(internalTimeline.pointerToRangeState)
          // const currentTime = val(timelineInstance.statePointer.time)
          const width = val(allInOnePanelStuffP.rightWidth)
          const rightProps: IRightProps = {
            range: rangeState.rangeShownInPanel,
            duration: rangeState.duration,
            // currentTime,
            width,
            timelineInstance,
            setRange: internalTimeline._setRangeShownInPanel,
          }
          return <Right {...rightProps} />
        }}
      </PropsAsPointer>
    )}
  </AllInOnePanelStuff>
)
