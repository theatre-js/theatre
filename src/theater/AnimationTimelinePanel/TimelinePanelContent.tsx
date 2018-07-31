import React from 'react'
import css from './TimelinePanelContent.css'
import Panel, {
  PanelWidthChannel,
} from '$theater/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import TimelineInstance from '$theater/componentModel/react/TheaterComponent/TimelineInstance/TimelineInstance'
import {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import {noop, clamp} from 'lodash'
import {
  focusedTimeToX,
  xToFocusedTime,
  deltaXToFocusedTime,
  addGlobalSeekerDragRule,
  removeGlobalSeekerDragRule,
  timeToX,
  getSvgWidth,
  xToTime,
} from '$theater/AnimationTimelinePanel/utils'
import memoizeOne from 'memoize-one'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import TimeUI from '$theater/AnimationTimelinePanel/TimeUI/TimeUI'
import RootPropProvider from '$theater/AnimationTimelinePanel/RootPropProvider'
import BoxesContainer from '$theater/AnimationTimelinePanel/BoxesContainer/BoxesContainer'
import SelectionProvider from '$theater/AnimationTimelinePanel/SelectionProvider/SelectionProvider'
import OverlaysProvider from '$theater/AnimationTimelinePanel/OverlaysProvider/OverlaysProvider'
import FramesGrid from '$theater/AnimationTimelinePanel/FramesGrid'

interface IOwnProps {
  timelineInstance: TimelineInstance
  pathToTimeline: string[]
}

interface IProps extends IOwnProps {
  boxWidth: number
  panelWidth: number
}

interface IState {
  focus: [number, number]
  duration: number
  currentTime: number
  timeBox?: BoxAtom<number>
  untapFromTimeBoxChanges: () => void
}

export const BOX_LEGEND_WIDTH = parseFloat(css.boxLegendWidth)

class TimelinePanelContent extends React.PureComponent<IProps, IState> {
  wrapper: HTMLDivElement | null
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      focus: [0, 8000],
      duration: 600000,
      currentTime: 0,
      untapFromTimeBoxChanges: noop,
    }
  }

  componentDidMount() {
    window.addEventListener('keypress', this.handleKeyPress)
    this.updateTimeBox(this.props)
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.handleKeyPress)
  }

  componentWillReceiveProps(newProps: IProps) {
    this.updateTimeBox(newProps)
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.boxWidth !== this.props.boxWidth) this.scrollContainer()
  }

  handleKeyPress = (e: KeyboardEvent) => {
    if (e.keyCode === 32 && e.target === document.body) {
      e.preventDefault()
      if (this.props.timelineInstance) {
        this.props.timelineInstance.togglePlay()
      }
    }
  }

  updateTimeBox(props: IProps) {
    this.state.untapFromTimeBoxChanges()

    const timeBox = props.timelineInstance.atom.prop('time')
    const untapFromTimeBoxChanges = timeBox
      .changes()
      .tap(this.updateFromTimeBox)

    this.setState(() => ({
      currentTime: timeBox.getValue(),
      timeBox,
      untapFromTimeBoxChanges,
    }))
  }

  updateFromTimeBox = (currentTime: number) => {
    this.setState(() => ({currentTime}))
  }

  setCurrentTime(time: number) {
    this.state.timeBox!.set(clamp(time, 0, this.state.duration))
  }

  setFocus(focusLeft: number, focusRight: number) {
    this.setState(
      () => ({focus: [focusLeft, focusRight]}),
      this.scrollContainer,
    )
  }

  scrollContainer() {
    const {focus} = this.state
    const {boxWidth} = this.props
    const scrollLeft = (boxWidth * focus[0]) / (focus[1] - focus[0])

    this.wrapper!.scrollTo({left: scrollLeft})
  }

  seekTime = (dx: number) => {
    const {boxWidth} = this.props
    const {focus, currentTime} = this.state
    const currentTimeX = focusedTimeToX(focus, boxWidth)(currentTime)
    const newTime = xToFocusedTime(focus, boxWidth)(currentTimeX + dx)
    this.setCurrentTime(newTime)
  }

  updateFocus = (newFocusLeft: number, newFocusRight: number) => {
    const {focus, duration} = this.state
    if (newFocusRight - newFocusLeft < 1) {
      if (newFocusLeft === focus[0]) {
        newFocusRight = focus[0] + 1
      } else {
        newFocusLeft = focus[1] - 1
      }
    }

    if (newFocusLeft < 0) {
      newFocusLeft = 0
      newFocusRight = focus[1] - focus[0]
    }
    if (newFocusRight > duration) {
      newFocusLeft = duration - (focus[1] - focus[0])
      newFocusRight = duration
    }

    this.setFocus(newFocusLeft, newFocusRight)
  }

  updateZoom(newFocusLeft: number, newFocusRight: number) {
    const {duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
    }
    if (newFocusRight > duration) {
      newFocusRight = duration
    }
    if (newFocusRight - newFocusLeft < 1) return

    this.setFocus(newFocusLeft, newFocusRight)
  }

  syncSeekerWithMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const {boxWidth, timelineInstance} = this.props
    const {focus, duration} = this.state
    const svgWidth = getSvgWidth(duration, focus, boxWidth)
    const newTime = xToTime(duration, svgWidth)(e.nativeEvent.offsetX)
    if (timelineInstance.playing) {
      timelineInstance.pause()
      this.setCurrentTime(newTime)
      timelineInstance.play()
    } else {
      this.setCurrentTime(newTime)
      addGlobalSeekerDragRule()
    }
  }

  handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // horizontal scroll
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) {
      e.preventDefault()
      e.stopPropagation()
      const {focus} = this.state
      const change = deltaXToFocusedTime(focus, this.props.boxWidth)(e.deltaX)
      this.updateFocus(focus[0] + change, focus[1] + change)
      return
    }

    // pinch
    if (e.ctrlKey) {
      e.preventDefault()
      e.stopPropagation()
      const {focus, duration} = this.state
      const {boxWidth} = this.props
      const svgWidth = getSvgWidth(duration, focus, boxWidth)
      const focusLeftX = timeToX(duration, svgWidth)(focus[0])
      const change = deltaXToFocusedTime(focus, boxWidth)(e.deltaY) * 3.5
      const fraction = (e.nativeEvent.offsetX - focusLeftX) / boxWidth

      this.updateZoom(
        focus[0] - change * fraction,
        focus[1] + change * (1 - fraction),
      )
    }
  }

  render() {
    const {boxWidth, panelWidth, pathToTimeline} = this.props
    const {focus, duration, currentTime} = this.state

    const svgWidth = getSvgWidth(duration, focus, boxWidth)

    return (
      <>
        <FramesGrid
          canvasWidth={boxWidth}
          containerWidth={panelWidth}
          focus={focus}
        />
        <DraggableArea
          onDragStart={this.syncSeekerWithMousePosition}
          onDrag={this.seekTime}
          onDragEnd={removeGlobalSeekerDragRule}
          shouldReturnMovement={true}
        >
          <div
            ref={c => (this.wrapper = c)}
            className={css.wrapper}
            style={{width: panelWidth}}
            onWheel={this.handleWheel}
          >
            <div
              className={css.scrollingContainer}
              style={{width: svgWidth + BOX_LEGEND_WIDTH}}
            >
              <SelectionProvider
                pathToTimeline={pathToTimeline}
                focus={focus}
                duration={duration}
                boxWidth={boxWidth}
              >
                <OverlaysProvider pathToTimeline={pathToTimeline}>
                  <RootPropProvider
                    duration={duration}
                    svgWidth={svgWidth}
                    boxWidth={boxWidth}
                    panelWidth={panelWidth}
                  >
                    {memoizedBoxesContainer(pathToTimeline)}
                  </RootPropProvider>
                </OverlaysProvider>
              </SelectionProvider>
            </div>
          </div>
        </DraggableArea>
        <TimeUI
          boxWidth={boxWidth}
          currentTime={currentTime}
          duration={duration}
          focus={focus}
          seekTime={this.seekTime}
          updateFocus={this.updateFocus}
        />
      </>
    )
  }
}

const memoizedBoxesContainer = memoizeOne((pathToTimeline: string[]) => (
  <BoxesContainer pathToTimeline={pathToTimeline} />
))

export default (props: IOwnProps) => (
  <Panel
    header="hidden"
    css={{
      container: css.panelContainer,
      content: css.panelContent,
    }}
  >
    <Subscriber channel={PanelWidthChannel}>
      {(panelWidth: number) => (
        <TimelinePanelContent
          {...props}
          panelWidth={panelWidth}
          boxWidth={panelWidth - BOX_LEGEND_WIDTH}
        />
      )}
    </Subscriber>
  </Panel>
)
