import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse2/atom'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import {
  deltaXToTime,
  getSvgWidth,
  inRangeXToTime,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {
  getNewRange,
  getNewZoom,
  clampTime,
} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import TimelineProviders from '$tl/ui/panels/AllInOnePanel/Right/timeline/TimelineProviders'
import ItemsContainer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemsContainer'
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TimeStuff} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {defer} from '$shared/utils/defer'

const classes = resolveCss(css)

interface IExportedComponentProps {}

interface IRightProps {
  range: TRange
  duration: TDuration
  timelineWidth: number
  timelineInstance: TimelineInstance
  setRange: (range: TRange) => void
}

interface IRightState {}

class Right extends UIComponent<IRightProps, IRightState> {
  wrapper: React.RefObject<HTMLDivElement> = React.createRef()
  wrapperLeft: number
  scrollLeft: number = 0
  allowZoom: boolean = true
  didMountDeferred = defer<void>()

  constructor(props: IRightProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {range, duration, timelineWidth} = this.props
    const svgWidth = getSvgWidth(range, duration, timelineWidth)
    this._scrollContainer(range)
    return (
      <>
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
              <TimelineProviders
                disableZoom={this.disableZoom}
                enableZoom={this.enableZoom}
              >
                <ItemsContainer />
              </TimelineProviders>
            </div>
          </div>
        </DraggableArea>
        <PropsAsPointer>{this._subscribeToPanelChanges}</PropsAsPointer>
      </>
    )
  }

  componentDidMount() {
    this.didMountDeferred.resolve(undefined)
    this._updateWrapperLeft()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  _subscribeToPanelChanges = () => {
    val(this.ui.atomP.historic.allInOnePanel.margins)
    this._updateWrapperLeft()
    return null
  }

  _updateWrapperLeft() {
    if (this.wrapper.current == null) return
    this.wrapperLeft = this.wrapper.current.getBoundingClientRect().left
  }

  handleResize = () => {
    this._updateWrapperLeft()
    this._scrollContainer(this.props.range)
  }

  syncSeekerWithMousePosition = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement) return

    const {timelineWidth, range, duration, timelineInstance} = this.props
    const newTime = inRangeXToTime(range, duration, timelineWidth)(
      event.clientX - this.wrapperLeft,
    )
    timelineInstance.time = newTime
  }

  seekTime = (_: number, __: number, event: MouseEvent) => {
    if (event.target instanceof HTMLInputElement) return

    const {range, duration, timelineWidth, timelineInstance} = this.props
    const newTime = inRangeXToTime(range, duration, timelineWidth)(
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
      const dt = deltaXToTime(range, timelineWidth)(event.deltaX * 3)

      const change = {from: dt, to: dt}
      this.props.setRange(getNewRange(range, change, duration))
      return
    }

    // pinch
    if (event.ctrlKey && this.allowZoom) {
      event.preventDefault()
      event.stopPropagation()
      const {range, duration, timelineWidth} = this.props
      const dt = deltaXToTime(range, timelineWidth)(event.deltaY) * 3.5
      const zoomTime = inRangeXToTime(range, duration, timelineWidth)(
        event.clientX - this.wrapperLeft,
      )
      const fraction = (zoomTime - range.from) / (range.to - range.from)
      const change = {from: -dt * fraction, to: dt * (1 - fraction)}
      this.props.setRange(getNewZoom(range, change, duration))
    }
  }

  _scrollContainer = (range: TRange) => {
    if (!this.wrapper.current) {
      this.didMountDeferred.promise.then(() => this._scrollContainer(range))
      return
    }
    const {timelineWidth} = this.props
    const scrollLeft = (timelineWidth * range.from) / (range.to - range.from)

    if (scrollLeft !== this.scrollLeft) {
      this.scrollLeft = scrollLeft
      this.wrapper.current.scrollTo({left: scrollLeft})
    }
  }

  enableZoom = () => {
    this.allowZoom = true
  }

  disableZoom = () => {
    this.allowZoom = false
  }
}

export default (_props: IExportedComponentProps) => (
  <TimeStuff>
    {timeStuffP => (
      <PropsAsPointer>
        {() => {
          const range = val(timeStuffP.range)
          const rightProps: IRightProps = {
            range,
            duration: val(timeStuffP.overshotDuration),
            timelineWidth: val(timeStuffP.viewportWidth),
            timelineInstance: val(timeStuffP.timelineInstance),
            setRange: val(timeStuffP.setRange),
          }

          return <Right {...rightProps} />
        }}
      </PropsAsPointer>
    )}
  </TimeStuff>
)
