import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React, {createContext} from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse/atom'
import TimelineInstance from '$tl/timelines/TimelineInstance/TimelineInstance'
import {
  deltaXToTime,
  getScrollSpaceWidth_deprecated,
  viewportScrolledSpace,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {
  getNewRange,
  getNewZoom,
  clampTime,
} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import TimelineProviders from '$tl/ui/panels/AllInOnePanel/Right/timeline/TimelineProviders'
import ItemsContainer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemsContainer'
import {IRange, IDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TimeStuffContext,
  ITimeStuffP,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {defer} from '$shared/utils/defer'
import withContext from '$shared/utils/react/withContext'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

// this is is the wrong location
export const IsSeekingContext = createContext<boolean>(false)

const classes = resolveCss(css)

interface IRightProps {
  range: IRange
  duration: IDuration
  timelineWidth: number
  timelineInstance: TimelineInstance
  setRange: (range: IRange) => void
  heightMinusBottom: number
  setIsSeeking: (is: boolean) => void
}

interface IRightState {
  // isSeeking: boolean
}

class Right extends UIComponent<IRightProps, IRightState> {
  wrapper: React.RefObject<HTMLDivElement> = React.createRef()
  cachedCopyOfWrapper: HTMLDivElement | null = null
  wrapperLeft: number
  scrollLeft: number = 0
  allowZoom: boolean = true
  didMountDeferred = defer<void>()
  state = {}

  constructor(props: IRightProps, context: $IntentionalAny) {
    super(props, context)
  }

  render() {
    const {range, duration, timelineWidth} = this.props
    const viewportWidth = getScrollSpaceWidth_deprecated(
      range,
      duration,
      timelineWidth,
    )
    this._scrollContainer(range)

    return (
      <>
        <DraggableArea
          onDragStart={this.syncSeekerWithMousePosition}
          onDrag={this.seekTime}
          onDragEnd={this.seekTimeHasEnded}
          shouldReturnMovement={true}
          lockCursorTo="ew-resize"
        >
          <div ref={this.wrapper} {...classes('wrapper')}>
            <div
              style={{
                width: viewportWidth,
                minHeight: this.props.heightMinusBottom,
              }}
              {...classes('scrollingContainer')}
            >
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
    this._attachScrollListener()
  }

  componentDidUpdate() {
    this._attachScrollListener()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this._detachScrollListener()
  }

  _attachScrollListener() {
    // return
    const newWrapper = this.wrapper.current!
    if (this.cachedCopyOfWrapper !== newWrapper) {
      if (this.cachedCopyOfWrapper) this._detachScrollListener()
      this.cachedCopyOfWrapper = newWrapper
      this.cachedCopyOfWrapper.addEventListener(
        'wheel',
        this._receiveWheelEvent,
        {passive: false, capture: true},
      )
    }
  }

  _detachScrollListener() {
    this.cachedCopyOfWrapper!.removeEventListener(
      'wheel',
      this._receiveWheelEvent,
    )
  }

  _receiveWheelEvent = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault()
      event.stopPropagation()
      const {range, timelineWidth, duration} = this.props
      const dt = deltaXToTime(range, timelineWidth)(event.deltaX * 1)

      const change = {from: dt, to: dt}
      this.props.setRange(getNewRange(range, change, duration))
      return
    }

    // pinch
    if (event.ctrlKey) {
      event.preventDefault()
      event.stopPropagation()

      if (this.allowZoom) {
        if (this.wrapperLeft === 0) {
          this._updateWrapperLeft()
        }
        const {range, duration, timelineWidth} = this.props
        const dt = deltaXToTime(range, timelineWidth)(event.deltaY) * 3.7
        const zoomTime = viewportScrolledSpace.xToTime(
          range,
          duration,
          timelineWidth,
        )(event.clientX - this.wrapperLeft)
        const fraction = (zoomTime - range.from) / (range.to - range.from)
        const change = {from: -dt * fraction, to: dt * (1 - fraction)}

        this.props.setRange(getNewZoom(range, change, duration))
      }
    }
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

  syncSeekerWithMousePosition = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void | false => {
    if (event.target instanceof HTMLInputElement) return false
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return false
    }
    this._updateWrapperLeft()
    this.props.setIsSeeking(true)

    const {timelineWidth, range, duration, timelineInstance} = this.props
    const newTime = viewportScrolledSpace.xToTime(
      range,
      duration,
      timelineWidth,
    )(event.clientX - this.wrapperLeft)
    timelineInstance.time = newTime
  }

  seekTime = (_: number, __: number, event: MouseEvent) => {
    if (event.target instanceof HTMLInputElement) return
    const {range, duration, timelineWidth, timelineInstance} = this.props
    const newTime = viewportScrolledSpace.xToTime(
      range,
      duration,
      timelineWidth,
    )(event.clientX - this.wrapperLeft)
    timelineInstance.time = clampTime(range, newTime)
  }

  seekTimeHasEnded = () => {
    this.props.setIsSeeking(false)
  }

  UNSAFE_componentWillMount() {
    this.props.setIsSeeking(false)
  }

  componentWillMount() {
    this.props.setIsSeeking(false)
  }

  _scrollContainer = (range: IRange) => {
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

export default withContext({
  timeStuffP: TimeStuffContext,
})((props: {timeStuffP: ITimeStuffP}) => (
  <PropsAsPointer>
    {() => {
      const timeStuffP = props.timeStuffP
      const range = val(timeStuffP.rangeAndDuration.range)
      const rightProps: IRightProps = {
        range,
        duration: val(timeStuffP.rangeAndDuration.overshotDuration),
        timelineWidth: val(timeStuffP.viewportSpace.width),
        timelineInstance: val(timeStuffP.timelineInstance),
        setRange: val(timeStuffP.setRange),
        heightMinusBottom: val(timeStuffP.viewportSpace.height),
        setIsSeeking: val(timeStuffP.setIsSeeking),
      }

      return <Right {...rightProps} />
    }}
  </PropsAsPointer>
))
