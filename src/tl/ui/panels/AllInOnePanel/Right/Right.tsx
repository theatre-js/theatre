import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse/atom'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import {
  deltaXToTime,
  getSvgWidth,
  viewportScrolledSpace,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {
  getNewRange,
  getNewZoom,
  clampTime,
} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import TimelineProviders from '$tl/ui/panels/AllInOnePanel/Right/timeline/TimelineProviders'
import ItemsContainer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemsContainer'
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TimeStuffContext,
  ITimeStuffP,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {defer} from '$shared/utils/defer'
import withContext from '$shared/utils/react/withContext'

const classes = resolveCss(css)

interface IRightProps {
  range: TRange
  duration: TDuration
  timelineWidth: number
  timelineInstance: TimelineInstance
  setRange: (range: TRange) => void
  heightMinusBottom: number
}

interface IRightState {}

class Right extends UIComponent<IRightProps, IRightState> {
  wrapper: React.RefObject<HTMLDivElement> = React.createRef()
  cachedCopyOfWrapper: HTMLDivElement | null = null
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
    const viewportWidth = getSvgWidth(range, duration, timelineWidth)
    this._scrollContainer(range)
    return (
      <>
        <DraggableArea
          onDragStart={this.syncSeekerWithMousePosition}
          onDrag={this.seekTime}
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
    if (event.ctrlKey && this.allowZoom) {
      event.preventDefault()
      event.stopPropagation()
      const {range, duration, timelineWidth} = this.props
      const dt = deltaXToTime(range, timelineWidth)(event.deltaY) * 3.5
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

// export default (_props: IExportedComponentProps) => (
//   <TimeStuff>
//     {timeStuffP => (
//       <PropsAsPointer>
//         {() => {
//           const range = val(timeStuffP.rangeAndDuration.range)
//           const rightProps: IRightProps = {
//             range,
//             duration: val(timeStuffP.rangeAndDuration.overshotDuration),
//             timelineWidth: val(timeStuffP.viewportSpace.width),
//             timelineInstance: val(timeStuffP.timelineInstance),
//             setRange: val(timeStuffP.setRange),
//             heightMinusBottom: val(timeStuffP.viewportSpace.height),
//           }

//           return <Right {...rightProps} />
//         }}
//       </PropsAsPointer>
//     )}
//   </TimeStuff>
// )

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
      }

      return <Right {...rightProps} />
    }}
  </PropsAsPointer>
))

// const useAutoDerive = <T extends $IntentionalAny>(fn: () => T, deps: $IntentionalAny[]): T => {
//   const ticker = useContext(TickerContext)
//   const derivation = useMemo(() => {
//     return autoDerive(fn)
//   }, deps)
//   const untapRef = useRef(derivation.changes(ticker).tap((newValue) => {
//     setState(newValue)
//   }))

//   const effectCountRef = useRef(0)
//   const [state, setState] = useState(() => derivation.getValue())
//   useEffect(() => {
//     if (effectCountRef.current === 0) return
//   })

//   return state
// }

// const hookie = (props: IExportedComponentProps) => {
//   const timeStuffP = useContext(TimeStuffContext)
//   const props = useAutoDerive(() => {

//   })
// }
