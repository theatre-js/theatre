import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
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
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'

const classes = resolveCss(css)

interface IExportedComponentProps {}

interface IRightProps {
  range: TRange
  duration: TDuration
  // currentTime: number
  timelineWidth: number
  timelineInstance: TimelineInstance
  setRange: (range: TRange) => void
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
    const {range, duration, timelineWidth} = this.props
    const svgWidth = getSvgWidth(range, duration, timelineWidth)

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
    this._updateWrapperLeft()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  _updateWrapperLeft() {
    this.wrapperLeft = this.wrapper.current!.getBoundingClientRect().left
  }

  handleResize = () => {
    this._updateWrapperLeft()
    this._scrollContainer(this.props.range)
  }

  syncSeekerWithMousePosition = (event: React.MouseEvent<HTMLDivElement>) => {
    const {timelineWidth, range, timelineInstance} = this.props
    const newTime = xToInRangeTime(range, timelineWidth)(
      event.clientX - this.wrapperLeft,
    )
    timelineInstance.time = newTime
  }

  seekTime = (_: number, __: number, event: MouseEvent) => {
    const {range, timelineWidth, timelineInstance} = this.props
    const newTime = xToInRangeTime(range, timelineWidth)(
      event.clientX - this.wrapperLeft,
    )
    timelineInstance.time = clampTime(range, newTime)
  }

  handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // horizontal scroll
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault()
      event.stopPropagation()
      const {range, timelineWidth, duration} = this.props
      const dt = deltaXToInRangeTime(range, timelineWidth)(event.deltaX)

      const change = {from: dt, to: dt}
      this._setRange(getNewRange(range, change, duration))
      return
    }

    // pinch
    if (event.ctrlKey) {
      event.preventDefault()
      event.stopPropagation()
      const {range, duration, timelineWidth} = this.props
      const dt = deltaXToInRangeTime(range, timelineWidth)(event.deltaY) * 3.5
      const fraction = (event.clientX - this.wrapperLeft) / timelineWidth

      const change = {from: -dt * fraction, to: dt * (1 - fraction)}
      this._setRange(getNewZoom(range, change, duration))
    }
  }

  _setRange(range: TRange) {
    this.props.setRange(range)
    this._scrollContainer(range)
  }

  _scrollContainer = (range: TRange) => {
    const {timelineWidth} = this.props
    const scrollLeft = (timelineWidth * range.from) / (range.to - range.from)

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
            timelineWidth: width,
            timelineInstance,
            setRange: internalTimeline._setRangeShownInPanel,
          }
          return <Right {...rightProps} />
        }}
      </PropsAsPointer>
    )}
  </AllInOnePanelStuff>
)
