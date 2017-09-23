// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {getTimelineById} from '$studio/animationTimeline/selectors'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {moveBox, mergeBoxes, splitLane, resizeBox} from '$studio/animationTimeline/sagas'
import css from './index.css'
import SortableBox from './SortableBox'
import LaneViewer from './LaneViewer'

type Props = WithRunSagaProps & $FlowFixMe

type State = {
  isDragging: boolean,
  boxBeingDragged: $FlowFixMe,
  moveRatios: number[],
  boundaries: number[],
}

class Content extends React.Component {
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
    }
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(newProps.layout) !== JSON.stringify(this.props.layout)) {
      this._resetBoundariesAndRatios(newProps.layout, newProps.boxes)
    }
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
        boxBeingDragged: {
          index,
          offset,
          height,
        },
      }
    })
  }

  onBoxMove = (dy: number) => {
    const {boxBeingDragged: {index, offset, height}, boundaries} = this.state
    let edge, boundaryIndex, mergeIndexOffset, moveIndexOffset
    if (dy >= 0) {
      edge = offset + height + dy
      boundaryIndex = boundaries.findIndex((element) => edge < element) - 1
      moveIndexOffset = -1
      mergeIndexOffset = 0
    } else {
      edge = offset + dy
      boundaryIndex = boundaries.findIndex((element) => edge < element)
      moveIndexOffset = 0
      mergeIndexOffset = -1
    }

    if (boundaryIndex === -2) {
      const moveIndex = (index !== boundaries.length - 2) ? boundaries.length - 2 : null
      this._setBoxBeingDraggedToMoveTo(moveIndex)
    } else if (Math.abs(edge - boundaries[boundaryIndex]) < 20 || edge < 0) {
      this._setBoxBeingDraggedToMoveTo(boundaryIndex + moveIndexOffset)
    } else {
      this._setBoxBeingDraggedToMergeWith(boundaryIndex + mergeIndexOffset)
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

  render() {
    const {isDragging, boxBeingDragged, moveRatios} = this.state
    const {boxes, layout} = this.props
    return (
      <div className={css.container}>
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
                  <LaneViewer
                    lanes={box.lanes}
                    splitLane={(laneId) => this.splitLane(index, laneId)}/>
                }
              </SortableBox>
            )
          })
        }
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