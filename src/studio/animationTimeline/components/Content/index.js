// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {getTimelineById} from '$studio/animationTimeline/selectors'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {moveBox, mergeBoxes, splitLane, resizeBox} from '$studio/animationTimeline/sagas'
import css from './index.css'
import SortableBox from './SortableBox'
import LanesViewer from './LanesViewer'
import TimeBar from './TimeBar'

type Props = WithRunSagaProps & $FlowFixMe

type State = {
  isDragging: boolean,
  boxBeingDragged: $FlowFixMe,
  moveRatios: number[],
  boundaries: number[],
  panelWidth: number,
  duration: number,
  currentTime: number,
  focus: [number, number],
}

class Content extends React.Component<Props, State> {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)

    const {boxes, layout} = props

    this.state = {
      isDragging: false,
      boxBeingDragged: null,
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
      panelWidth: this._getPanelWidth(props.panelDimensions.x),
      duration: 60,
      focus: [10, 50],
      currentTime: 20,
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resetPanelWidthOnWindowResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resetPanelWidthOnWindowResize)
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(newProps.layout) !== JSON.stringify(this.props.layout)) {
      this._resetBoundariesAndRatios(newProps.layout, newProps.boxes)
    }
    if(newProps.panelDimensions.x !== this.props.panelDimensions.x) {
      this._resetPanelWidth(newProps.panelDimensions.x)
    }
  }

  _resetPanelWidthOnWindowResize = () => {
    this._resetPanelWidth(this.props.panelDimensions.x)
  }

  _getPanelWidth(xDim) {
    return (xDim / 100) * window.innerWidth - 40
  }

  _resetPanelWidth(xDim) {
    this.setState(() => ({
      panelWidth: this._getPanelWidth(xDim),
    }))
  }

  _resetBoundariesAndRatios(layout = this.props.layout, boxes = this.props.boxes) {
    this.setState(() => ({
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
    }))
  }

  _getBoundaries(boxes: $FlowFixMe, layout: $FlowFixMe) {
    return layout.reduce((boundaries, value, index) => {
      const {height} = boxes[value]
      return boundaries.concat(boundaries[index] + height)
    }, [0])
  }

  onBoxStartMove(index: number) {
    this.setState((state, props) => {
      const offset = state.boundaries[index]
      const id = props.layout[index]
      const height = props.boxes[id].height
      return {
        isDragging: true,
        boxBeingDragged: {index, offset, height},
      }
    })
  }

  onBoxMove = (dy: number) => {
    const {boxBeingDragged: {index, offset, height}, boundaries} = this.state
    const [edge, moveIndexOffset] = (dy >= 0) ? [offset + height + dy, -1] : [offset + dy, 0]
    const lowerBoundaryIndex = boundaries.findIndex((element) => edge < element)
    const upperBoundaryIndex = lowerBoundaryIndex - 1
    if (lowerBoundaryIndex === -1) {
      const moveTo = (index !== boundaries.length - 2) ? boundaries.length - 2 : null
      this._setBoxBeingDraggedToMoveTo(moveTo)
    } else if (edge < 0) {
      this._setBoxBeingDraggedToMoveTo(0)
    } else {
      const lowerBoundDistance = boundaries[lowerBoundaryIndex] - edge
      const upperBoundDistance = edge - boundaries[upperBoundaryIndex]
      if (lowerBoundDistance < 15) return this._setBoxBeingDraggedToMoveTo(lowerBoundaryIndex + moveIndexOffset)
      if (upperBoundDistance < 15) return this._setBoxBeingDraggedToMoveTo(upperBoundaryIndex + moveIndexOffset)
      return this._setBoxBeingDraggedToMergeWith(upperBoundaryIndex)
    }
  }

  _setBoxBeingDraggedToMoveTo(index: ?number){
    const draggedIndex = this.state.boxBeingDragged.index
    if (index === draggedIndex) index = null
    const moveRatios = this.props.layout.map((_, laneIndex) => {
      if (index == null) return 0
      if (draggedIndex < laneIndex && laneIndex <= index) return -1
      if (index <= laneIndex && laneIndex < draggedIndex) return 1
      return 0
    })

    this.setState((state) => ({
      boxBeingDragged: {
        ...state.boxBeingDragged,
        moveTo: index,
        mergeWith: null,
      },
      moveRatios,
    }))
  }

  _setBoxBeingDraggedToMergeWith(index: ?number){
    this.setState((state) => ({
      boxBeingDragged: {
        ...state.boxBeingDragged,
        moveTo: null,
        mergeWith: (index === state.boxBeingDragged.index) ? null : index,
      },
    }))
  }

  async onBoxEndMove() {
    const {boxBeingDragged: {index, moveTo, mergeWith}} = this.state
    const {timelineId, runSaga} = this.props
    if (moveTo != null) {
      await runSaga(moveBox, timelineId, index, moveTo)
    }
    else if (mergeWith != null) {
      await runSaga(mergeBoxes, timelineId, index, mergeWith)
    }
    
    this.setState(() => {
      return {
        isDragging: false,
        boxBeingDragged: null,
      }
    })
  }

  async splitLane(index: number, laneId: string) {
    const {timelineId, runSaga} = this.props
    await runSaga(splitLane, timelineId, index, laneId)
  }

  async onBoxResize(boxId: $FlowFixMe, newSize) {
    const {timelineId, runSaga} = this.props
    await runSaga(resizeBox, timelineId, boxId, newSize)
    this._resetBoundariesAndRatios()
  }

  changeFocusTo = (focus) => {
    this.setState(() => ({focus}))
  }

  changeCurrentTimeTo = (currentTime) => {
    this.setState(() => ({currentTime}))
  }

  render() {
    const {isDragging, boxBeingDragged, moveRatios, panelWidth, duration, focus, currentTime} = this.state
    const {boxes, layout} = this.props
    return (
      <div className={css.container}>
        <div className={css.timeBar}>
          <TimeBar
            panelWidth={panelWidth}
            duration={duration}
            currentTime={currentTime}
            focus={focus}
            changeFocusTo={this.changeFocusTo}
            changeCurrentTimeTo={this.changeCurrentTimeTo}/>
        </div>
        <div className={css.lanes}>
          {
            layout.map((id, index) => {
              const box = boxes[id]
              const boxTranslateY = moveRatios[index] * (isDragging ? boxBeingDragged.height : 0)
              const boxShowMergeOverlay = (isDragging && boxBeingDragged.index === index && boxBeingDragged.mergeWith != null)
              return (
                <SortableBox
                  key={id}
                  height={box.height}
                  translateY={boxTranslateY}
                  showMergeOverlay={boxShowMergeOverlay}
                  onMoveStart={() => this.onBoxStartMove(index)}
                  onMoveEnd={() => this.onBoxEndMove()}
                  onMove={this.onBoxMove}
                  onResize={(newSize) => this.onBoxResize(id, newSize)}>
                  {
                    <LanesViewer
                      boxHeight={box.height}
                      laneIds={box.lanes}
                      splitLane={(laneId) => this.splitLane(index, laneId)}
                      panelWidth={panelWidth}
                      duration={duration}
                      currentTime={currentTime}
                      focus={focus}/>
                  }
                </SortableBox>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: $FlowFixMe, ownProps: $FlowFixMe) => {
      const timeline = getTimelineById(state, ownProps.timelineId)
      return {...timeline}
    }
  ),
  withRunSaga(),
)(Content)