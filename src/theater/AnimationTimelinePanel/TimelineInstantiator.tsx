import React from 'react'
import TimelineInstance from '$theater/componentModel/react/TheaterComponent/TimelineInstance/TimelineInstance'
import TheaterComponent from '$theater/componentModel/react/TheaterComponent/TheaterComponent'
import {TimelineObject} from '$theater/AnimationTimelinePanel/types'
import TimelinePanelContent from '$theater/AnimationTimelinePanel/TimelinePanelContent'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

interface IProps extends TimelineObject {
  id: string
  volatileIdOfSelectedElement: string
  pathToTimeline: string[]
  selectedElement: TheaterComponent<$IntentionalAny>
}

interface IState {
  thingy?: string
  timelineInstance: undefined | TimelineInstance
}

class TimelineInstantiator extends PureComponentWithTheater<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      timelineInstance: undefined,
    }
  }

  componentDidMount() {
    this._updateThingy(this.props)
  }

  componentWillReceiveProps(newProps: IProps) {
    this._updateThingy(newProps)
  }

  _updateThingy(props: IProps = this.props) {
    const thingy = calculateThingy(
      props.volatileIdOfSelectedElement,
      props.pathToTimeline,
    )

    if (thingy === this.state.thingy) return

    const timelineId = props.pathToTimeline[props.pathToTimeline.length - 1]
    const element = props.selectedElement

    const timelineInstance = element.getTimelineInstance(timelineId)

    this.setState({
      thingy,
      timelineInstance,
    })
  }

  render() {
    const {timelineInstance} = this.state
    if (timelineInstance == null) return null

    const {pathToTimeline} = this.props
    return (
      <TimelinePanelContent
        timelineInstance={timelineInstance}
        pathToTimeline={pathToTimeline}
      />
    )
  }
}

function calculateThingy(
  volatileIdOfSelectedElement?: string,
  pathToTimeline?: string[],
) {
  if (!volatileIdOfSelectedElement || !pathToTimeline) {
    return undefined
  } else {
    return JSON.stringify({volatileIdOfSelectedElement, pathToTimeline})
  }
}

export default TimelineInstantiator
