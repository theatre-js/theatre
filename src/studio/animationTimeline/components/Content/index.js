// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getTimelineById} from '$studio/animationTimeline/selectors'
import generateUniqueId from 'uuid/v4'
import css from './index.css'
import SortableBox from './SortableBox'
import LanesViewer from './LanesViewer'
import TimeBar from './TimeBar'
import {
  type TimelineID,
  type TimelineObject,
  type BoxID,
  type BoxesObject,
  type LayoutArray,
} from '$studio/animationTimeline/types'
import {type XY} from '$studio/workspace/types'

type OwnProps = TimelineObject & {
  timelineId: TimelineID,
  panelDimensions: XY,
}

type Props = {dispatch: Function} & OwnProps

type State = {
  boxBeingDragged: ?{
    index: number,
    offset: number,
    height: number,
    mergeWith?: ?number,
    moveTo?: ?number,
  },
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
      boxBeingDragged: null,
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
      panelWidth: this._getPanelWidth(props.panelDimensions.x),
      duration: 60000,
      focus: [10000, 50000],
      currentTime: 20000,
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
    if (newProps.panelDimensions.x !== this.props.panelDimensions.x) {
      this._resetPanelWidth(newProps.panelDimensions.x)
    }
  }

  _resetPanelWidthOnWindowResize = () => {
    this._resetPanelWidth(this.props.panelDimensions.x)
  }

  _getPanelWidth(xDim) {
    return xDim / 100 * window.innerWidth - 16
    // return xDim / 100 * window.innerWidth - 40
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

  _getBoundaries(boxes: BoxesObject, layout: LayoutArray) {
    return layout.reduce(
      (boundaries, value, index) => {
        const {height} = boxes[value]
        return boundaries.concat(boundaries[index] + height)
      },
      [0],
    )
  }

  onBoxStartMove(index: number) {
    this.setState((state, props) => {
      const offset = state.boundaries[index]
      const id = props.layout[index]
      const height = props.boxes[id].height
      return {
        boxBeingDragged: {index, offset, height},
      }
    })
  }

  onBoxMove = (dy: number) => {
    if (this.state.boxBeingDragged == null) return
    const {boxBeingDragged, boundaries} = this.state
    const {index, offset, height} = boxBeingDragged
    const [edge, moveIndexOffset] =
      dy >= 0 ? [offset + height + dy, -1] : [offset + dy, 0]
    const lowerBoundaryIndex = boundaries.findIndex(element => edge < element)
    const upperBoundaryIndex = lowerBoundaryIndex - 1
    if (lowerBoundaryIndex === -1) {
      const moveTo = index !== boundaries.length - 2 ? boundaries.length - 2 : null
      this._setBoxBeingDraggedToMoveTo(moveTo)
    } else if (edge < 0) {
      this._setBoxBeingDraggedToMoveTo(0)
    } else {
      const lowerBoundDistance = boundaries[lowerBoundaryIndex] - edge
      const upperBoundDistance = edge - boundaries[upperBoundaryIndex]
      if (lowerBoundDistance < 15)
        return this._setBoxBeingDraggedToMoveTo(lowerBoundaryIndex + moveIndexOffset)
      if (upperBoundDistance < 15)
        return this._setBoxBeingDraggedToMoveTo(upperBoundaryIndex + moveIndexOffset)
      return this._setBoxBeingDraggedToMergeWith(upperBoundaryIndex)
    }
  }

  _setBoxBeingDraggedToMoveTo(index: ?number) {
    if (this.state.boxBeingDragged == null) return
    const draggedIndex = this.state.boxBeingDragged.index
    if (index === draggedIndex) index = null
    const moveRatios = this.props.layout.map((_, laneIndex) => {
      if (index == null) return 0
      if (draggedIndex < laneIndex && laneIndex <= index) return -1
      if (index <= laneIndex && laneIndex < draggedIndex) return 1
      return 0
    })

    this.setState(state => ({
      boxBeingDragged: {
        ...state.boxBeingDragged,
        moveTo: index,
        mergeWith: null,
      },
      moveRatios,
    }))
  }

  _setBoxBeingDraggedToMergeWith(index: ?number) {
    this.setState(state => ({
      boxBeingDragged: {
        ...state.boxBeingDragged,
        moveTo: null,
        mergeWith:
          state.boxBeingDragged != null && index === state.boxBeingDragged.index
            ? null
            : index,
      },
    }))
  }

  onBoxEndMove() {
    if (this.state.boxBeingDragged == null) return
    const {index, moveTo, mergeWith} = this.state.boxBeingDragged
    const {timelineId, dispatch} = this.props
    if (moveTo != null) {
      dispatch(
        reduceStateAction(
          ['animationTimeline', 'timelines', 'byId', timelineId, 'layout'],
          layout => {
            const newLayout = layout.slice()
            newLayout.splice(index, 0, newLayout.splice(moveTo, 1)[0])
            return newLayout
          },
        )
      )
    } else if (mergeWith != null) {
      dispatch(
        reduceStateAction(
          ['animationTimeline', 'timelines', 'byId', timelineId],
          ({layout, boxes}) => {
            const fromId = layout[index]
            const toId = layout[mergeWith]

            const newLayout = layout.slice()
            newLayout.splice(index, 1)

            const {[fromId]: mergedBox, ...newBoxes} = boxes
            newBoxes[toId].lanes = newBoxes[toId].lanes.concat(mergedBox.lanes)

            return {
              layout: newLayout,
              boxes: newBoxes,
            }
          }
        )
      )
    }

    this.setState(() => {
      return {
        boxBeingDragged: null,
      }
    })
  }

  splitLane(index: number, laneId: string) {
    const {timelineId, dispatch} = this.props
    dispatch(
      reduceStateAction(
        ['animationTimeline', 'timelines', 'byId', timelineId],
        ({layout, boxes}) => {
          const fromId = layout[index]
          const newBoxId = generateUniqueId()

          const fromBox = boxes[fromId]
          const newLanes = fromBox.lanes.slice()
          newLanes.splice(newLanes.indexOf(laneId), 1)

          const newBoxes = {
            ...boxes,
            [fromId]: {
              ...fromBox,
              lanes: newLanes,
            },
            [newBoxId]: {
              id: newBoxId,
              height: fromBox.height,
              lanes: [laneId],
            },
          }

          const newLayout = layout.slice()
          newLayout.splice(index + 1, 0, newBoxId)

          return {
            layout: newLayout,
            boxes: newBoxes,
          }
        },
      )
    )
  }

  onBoxResize(boxId: BoxID, newSize) {
    const {timelineId, dispatch} = this.props
    dispatch(
      reduceStateAction(
        ['animationTimeline', 'timelines', 'byId', timelineId, 'boxes', boxId, 'height'],
        () => newSize,
      )
    )
    this._resetBoundariesAndRatios()
  }

  changeFocusTo = focus => {
    this.setState(() => ({focus}))
  }

  changeCurrentTimeTo = currentTime => {
    this.setState(() => ({currentTime}))
  }

  changeDuration = (newDuration: number) => {
    const {focus, duration, currentTime} = this.state
    let newFocus = focus
    let newCurrentTime = currentTime
    if (newDuration < currentTime) newCurrentTime = newDuration
    if (newDuration < duration) {
      if (focus[1] > newDuration && focus[0] < newDuration) {
        newFocus[1] = newDuration
      } else if (focus[0] >= newDuration) {
        const focusLength = focus[1] - focus[0]
        if (focusLength < newDuration) {
          newFocus = [newDuration - focusLength, focusLength]
        } else {
          newFocus = [0, newDuration]
        }
      }
    }
    this.setState(() => ({
      currentTime: newCurrentTime,
      duration: newDuration,
      focus: newFocus,
    }))
  }

  render() {
    const {
      boxBeingDragged,
      moveRatios,
      panelWidth,
      duration,
      focus,
      currentTime,
    } = this.state
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
            changeCurrentTimeTo={this.changeCurrentTimeTo}
            changeDuration={this.changeDuration}
          />
        </div>
        <div className={css.lanes}>
          {layout.map((id, index) => {
            const box = boxes[id]
            const boxTranslateY =
              moveRatios[index] * (boxBeingDragged != null ? boxBeingDragged.height : 0)
            const boxShowMergeOverlay =
              boxBeingDragged != null &&
              boxBeingDragged.index === index &&
              boxBeingDragged.mergeWith != null
            return (
              <SortableBox
                key={id}
                height={box.height}
                translateY={boxTranslateY}
                showMergeOverlay={boxShowMergeOverlay}
                onMoveStart={() => this.onBoxStartMove(index)}
                onMoveEnd={() => this.onBoxEndMove()}
                onMove={this.onBoxMove}
                onResize={newSize => this.onBoxResize(id, newSize)}
              >
                {
                  <LanesViewer
                    boxHeight={box.height}
                    laneIds={box.lanes}
                    splitLane={laneId => this.splitLane(index, laneId)}
                    panelWidth={panelWidth}
                    duration={duration}
                    currentTime={currentTime}
                    focus={focus}
                  />
                }
              </SortableBox>
            )
          })}
        </div>
      </div>
    )
  }
}

export default connect((s, op) => {
  const timeline = getTimelineById(s, op.timelineId)
  return {...timeline}
})(Content)
