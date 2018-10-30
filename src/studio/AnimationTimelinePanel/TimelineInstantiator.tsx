import React from 'react'
import TimelineInstance from '$studio/componentModel/react/TheatreComponent/TimelineInstance/TimelineInstance'
import TheatreComponent from '$studio/componentModel/react/TheatreComponent/TheatreComponent'
import {TimelineObject} from '$studio/AnimationTimelinePanel/types'
import TimelinePanelContent from '$studio/AnimationTimelinePanel/TimelinePanelContent'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'

interface IProps extends TimelineObject {
  id: string
  volatileIdOfSelectedElement: string
  pathToTimeline: string[]
  selectedElement: TheatreComponent<$IntentionalAny>
}

interface IState {
  thingy?: string
  timelineInstance: undefined | TimelineInstance
}

class TimelineInstantiator extends PureComponentWithTheatre<IProps, IState> {
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
