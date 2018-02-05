import {React, connect, reduceStateAction} from '$src/studio/handy'
import {getTimelineById} from '$src/studio/animationTimeline/selectors'
import generateUniqueId from 'uuid/v4'
import css from './AnimationTimelinePanel.css'
import SortableBox from './SortableBox'
import VariablesViewer from './VariablesViewer'
import TimeBar from './TimeBar'
import {Subscriber} from 'react-broadcast'
import {PanelWidthChannel} from '$src/studio/workspace/components/Panel/Panel'

import {
  TimelineID,
  TimelineObject,
  BoxID,
  BoxesObject,
  LayoutArray,
} from '$src/studio/animationTimeline/types'
import {XY} from '$src/studio/workspace/types'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import {throttle} from 'lodash'

type OwnProps = TimelineObject & {
  timelineId: TimelineID
  panelDimensions: XY
  tempShowTimeGrid
}

type Props = {dispatch: Function} & OwnProps

type State = {
  boxBeingDragged:
    | undefined
    | null
    | {
        index: number
        offset: number
        height: number
        mergeWith?: undefined | null | number
        moveTo?: undefined | null | number
      }
  moveRatios: number[]
  boundaries: number[]
  duration: number
  currentTime: number
  focus: [number, number]
}

class Content extends React.Component<Props, State> {
  static panelConfig = {
    headerLess: true,
  }

  constructor(props: Props) {
    super(props)

    const {boxes, layout} = props
    // this._handleScroll = throttle(this._handleScroll.bind(this), 200)

    this.state = {
      boxBeingDragged: null,
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
      duration: 60000,
      focus: [10000, 50000],
      currentTime: 30000,
    }
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(newProps.layout) !== JSON.stringify(this.props.layout)) {
      this._resetBoundariesAndRatios(newProps.layout, newProps.boxes)
    }
    // if (newProps.panelDimensions.x !== this.props.panelDimensions.x) {
    //   this._resetPanelWidth(newProps.panelDimensions.x)
    // }
  }

  componentDidMount() {
    const {duration, focus} = this.state
    const svgWidth =
      duration / (focus[1] - focus[0]) * (this.container.clientWidth - 30)
    setTimeout(() => {
      this.variablesContainer.scrollTo(svgWidth * focus[0] / duration, 0)
    }, 0)
  }

  // _resetPanelWidthOnWindowResize = () => {
  //   this._resetPanelWidth(this.props.panelDimensions.x)
  // }

  // _getPanelWidth(xDim) {
  //   return xDim - 10
  // return xDim / 100 * window.innerWidth - 16
  // }

  // _resetPanelWidth(xDim) {
  //   this.setState(() => ({
  //     panelWidth: this._getPanelWidth(xDim),
  //   }))
  // }

  _resetBoundariesAndRatios(
    layout = this.props.layout,
    boxes = this.props.boxes,
  ) {
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
      const moveTo =
        index !== boundaries.length - 2 ? boundaries.length - 2 : null
      this._setBoxBeingDraggedToMoveTo(moveTo)
    } else if (edge < 0) {
      this._setBoxBeingDraggedToMoveTo(0)
    } else {
      const lowerBoundDistance = boundaries[lowerBoundaryIndex] - edge
      const upperBoundDistance = edge - boundaries[upperBoundaryIndex]
      if (lowerBoundDistance < 15)
        return this._setBoxBeingDraggedToMoveTo(
          lowerBoundaryIndex + moveIndexOffset,
        )
      if (upperBoundDistance < 15)
        return this._setBoxBeingDraggedToMoveTo(
          upperBoundaryIndex + moveIndexOffset,
        )
      return this._setBoxBeingDraggedToMergeWith(upperBoundaryIndex)
    }
  }

  _setBoxBeingDraggedToMoveTo(index: undefined | null | number) {
    if (this.state.boxBeingDragged == null) return
    const draggedIndex = this.state.boxBeingDragged.index
    if (index === draggedIndex) index = null
    const moveRatios = this.props.layout.map((_, variableIndex) => {
      if (index == null) return 0
      if (draggedIndex < variableIndex && variableIndex <= index) return -1
      if (index <= variableIndex && variableIndex < draggedIndex) return 1
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

  _setBoxBeingDraggedToMergeWith(index: undefined | null | number) {
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
        ),
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
            newBoxes[toId].variables = newBoxes[toId].variables.concat(mergedBox.variables)

            return {
              layout: newLayout,
              boxes: newBoxes,
            }
          },
        ),
      )
    }

    this.setState(() => {
      return {
        boxBeingDragged: null,
      }
    })
  }

  splitVariable(index: number, variableId: string) {
    const {timelineId, dispatch} = this.props
    dispatch(
      reduceStateAction(
        ['animationTimeline', 'timelines', 'byId', timelineId],
        ({layout, boxes}) => {
          const fromId = layout[index]
          const newBoxId = generateUniqueId()

          const fromBox = boxes[fromId]
          const newVariables = fromBox.variables.slice()
          newVariables.splice(newVariables.indexOf(variableId), 1)

          const newBoxes = {
            ...boxes,
            [fromId]: {
              ...fromBox,
              variables: newVariables,
            },
            [newBoxId]: {
              id: newBoxId,
              height: fromBox.height,
              variables: [variableId],
            },
          }

          const newLayout = layout.slice()
          newLayout.splice(index + 1, 0, newBoxId)

          return {
            layout: newLayout,
            boxes: newBoxes,
          }
        },
      ),
    )
  }

  onBoxResize(boxId: BoxID, newSize) {
    const {timelineId, dispatch} = this.props
    dispatch(
      reduceStateAction(
        [
          'animationTimeline',
          'timelines',
          'byId',
          timelineId,
          'boxes',
          boxId,
          'height',
        ],
        () => newSize,
      ),
    )
    this._resetBoundariesAndRatios()
  }

  changeFocusRightTo = (newFocusRight: number, panelWidth: number) => {
    const {focus, duration} = this.state
    if (newFocusRight > duration) newFocusRight = duration
    if (newFocusRight - focus[0] < 1000) newFocusRight = focus[0] + 1000

    this._reallyChangeFocusTo(focus[0], newFocusRight, panelWidth)
  }

  changeFocusLeftTo = (newFocusLeft: number, panelWidth: number) => {
    const {focus} = this.state
    if (newFocusLeft < 0) newFocusLeft = 0
    if (focus[1] - newFocusLeft < 1000) newFocusLeft = focus[1] - 1000

    this._reallyChangeFocusTo(newFocusLeft, focus[1], panelWidth)
  }

  _changeZoomLevel = (
    newFocusLeft: number,
    newFocusRight: number,
    panelWidth: number,
  ) => {
    const {duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
    }
    if (newFocusRight > duration) {
      newFocusRight = duration
    }
    if (newFocusRight - newFocusLeft < 1) return
    const svgWidth = duration / (newFocusRight - newFocusLeft) * panelWidth
    this.variablesContainer.scrollLeft = svgWidth * newFocusLeft / duration
    this._reallyChangeFocusTo(newFocusLeft, newFocusRight, panelWidth)
  }

  changeFocusAndScrollVariablesContainer = (
    newFocusLeft: number,
    newFocusRight: number,
    panelWidth: number,
  ) => {
    const {focus, duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
      newFocusRight = focus[1] - focus[0]
    }
    if (newFocusRight > duration) {
      newFocusLeft = duration - (focus[1] - focus[0])
      newFocusRight = duration
    }

    const svgWidth = duration / (newFocusRight - newFocusLeft) * panelWidth
    this.variablesContainer.scrollLeft = svgWidth * newFocusLeft / duration

    this._reallyChangeFocusTo(newFocusLeft, newFocusRight, panelWidth)
  }

  _changeFocusTo = (
    newFocusLeft: number,
    newFocusRight: number,
    panelWidth: number,
  ) => {
    const {focus, duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
      newFocusRight = focus[1] - focus[0]
    }
    if (newFocusRight > duration) {
      newFocusLeft = duration - (focus[1] - focus[0])
      newFocusRight = duration
    }

    this._reallyChangeFocusTo(newFocusLeft, newFocusRight, panelWidth)
  }

  _reallyChangeFocusTo(
    newFocusLeft: number,
    newFocusRight: number,
    panelWidth: number,
  ) {
    const {focus, currentTime} = this.state
    const newTimeX = this.focusedTimeToX(currentTime, focus, panelWidth)
    const newCurrentTime = this.xToFocusedTime(
      newTimeX,
      [newFocusLeft, newFocusRight],
      panelWidth,
    )

    this.setState(() => ({
      currentTime: newCurrentTime,
      focus: [newFocusLeft, newFocusRight],
    }))
  }

  changeCurrentTimeTo = (currentTime: number) => {
    const {focus} = this.state
    if (currentTime < focus[0]) currentTime = focus[0]
    if (currentTime > focus[1]) currentTime = focus[1]
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

  handleScroll(e: React.WheelEvent<$FixMe>, panelWidth: number) {
    e.persist()
    this._handleScroll(e, panelWidth)
  }

  _handleScroll(e: React.WheelEvent<$FixMe>, panelWidth: number) {
    const isHorizontal = Math.abs(e.deltaY) > Math.abs(e.deltaX)
    if (e.ctrlKey || (isHorizontal && e.shiftKey)) {
      e.preventDefault()
      e.stopPropagation()
      if (e.nativeEvent.target !== this.variablesContainer) {
        const {focus, duration} = this.state
        const svgWidth = duration / (focus[1] - focus[0]) * panelWidth
        const focusLeftX = focus[0] / duration * svgWidth
        const focusRightX = focus[1] / duration * svgWidth
        const fraction =
          (e.nativeEvent.offsetX - focusLeftX) / (focusRightX - focusLeftX)
        const change = e.deltaY / panelWidth * (focus[1] - focus[0]) * 3.5

        this._changeZoomLevel(
          focus[0] - change * fraction,
          focus[1] + change * (1 - fraction),
          panelWidth,
        )
      }
      return
    }

    if (!isHorizontal) {
      const {focus} = this.state
      const change = e.deltaX / panelWidth * (focus[1] - focus[0])
      this._changeFocusTo(focus[0] + change, focus[1] + change, panelWidth)
    }

    // if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    //   if (e.shiftKey) {
    //     if (e.nativeEvent.target !== this.variablesContainer) {
    //       const {focus, duration} = this.state
    //       const svgWidth = duration / (focus[1] - focus[0]) * panelWidth
    //       const focusLeftX = focus[0] / duration * svgWidth
    //       const focusRightX = focus[1] / duration * svgWidth
    //       const fraction = (e.nativeEvent.offsetX - focusLeftX) / (focusRightX - focusLeftX)
    //       const change = e.deltaY / panelWidth * (focus[1] - focus[0])
    //       this._changeZoomLevel(focus[0] - change * fraction, focus[1] + change * (1 - fraction), panelWidth)
    //     }
    //   }
    // } else {
    //   const {focus} = this.state
    //   const change = e.deltaX / panelWidth * (focus[1] - focus[0])
    //   this._changeFocusTo(focus[0] + change, focus[1] + change, panelWidth)
    // }
  }

  timeToX(t: number, panelWidth: number) {
    const {duration} = this.state
    return t * (panelWidth - 6) / duration
  }

  xToTime(x: number, panelWidth: number) {
    const {duration} = this.state
    return x * duration / (panelWidth - 6)
  }

  focusedTimeToX(t: number, focus: [number, number], panelWidth: number) {
    return (t - focus[0]) / (focus[1] - focus[0]) * (panelWidth - 6)
  }

  xToFocusedTime(x: number, focus: [number, number], panelWidth: number) {
    return x * (focus[1] - focus[0]) / (panelWidth - 6) + focus[0]
  }

  render() {
    // console.log('render')
    const {
      boxBeingDragged,
      moveRatios,
      duration,
      focus,
      currentTime,
    } = this.state
    const {boxes, layout} = this.props
    return (
      <Panel
        headerLess={true}
        css={{
          container: css.panelContainer,
          innerWrapper: css.panelInnerWrapper,
        }}
      >
        <Subscriber channel={PanelWidthChannel}>
          {(panelWidth: number) => {
            panelWidth -= 30
            return (
              <div
                ref={c => (this.container = c)}
                className={css.container}
                onWheel={e => this.handleScroll(e, panelWidth)}
              >
                <div className={css.timeBar}>
                  <TimeBar
                    panelWidth={panelWidth}
                    duration={duration}
                    currentTime={currentTime}
                    focus={focus}
                    timeToX={(t: number) => this.timeToX(t, panelWidth)}
                    xToTime={(x: number) => this.xToTime(x, panelWidth)}
                    focusedTimeToX={(t: number, focus: [number, number]) =>
                      this.focusedTimeToX(t, focus, panelWidth)
                    }
                    xToFocusedTime={(x: number, focus: [number, number]) =>
                      this.xToFocusedTime(x, focus, panelWidth)
                    }
                    changeFocusTo={(focusLeft: number, focusRight: number) =>
                      this.changeFocusAndScrollVariablesContainer(
                        focusLeft,
                        focusRight,
                        panelWidth,
                      )
                    }
                    changeFocusRightTo={(focus: number) =>
                      this.changeFocusRightTo(focus, panelWidth)
                    }
                    changeFocusLeftTo={(focus: number) =>
                      this.changeFocusLeftTo(focus, panelWidth)
                    }
                    changeCurrentTimeTo={this.changeCurrentTimeTo}
                    changeDuration={this.changeDuration}
                  />
                </div>
                <div ref={c => (this.variablesContainer = c)} className={css.variables}>

                  {layout.map((id, index) => {
                    const box = boxes[id]
                    const boxTranslateY =
                      moveRatios[index] *
                      (boxBeingDragged != null ? boxBeingDragged.height : 0)
                    const canBeMerged =
                      boxBeingDragged != null &&
                      boxBeingDragged.index === index &&
                      boxBeingDragged.mergeWith != null
                    const shouldIndicateMerge =
                      boxBeingDragged != null &&
                      boxBeingDragged.mergeWith !== null &&
                      boxBeingDragged.mergeWith === index
                    return (
                      <SortableBox
                        key={id}
                        height={box.height}
                        translateY={boxTranslateY}
                        // showMergeOverlay={boxShowMergeOverlay}
                        onMoveStart={() => this.onBoxStartMove(index)}
                        onMoveEnd={() => this.onBoxEndMove()}
                        onMove={this.onBoxMove}
                        onResize={newSize => this.onBoxResize(id, newSize)}
                      >
                        {
                          <VariablesViewer
                            tempIncludeTimeGrid={index === 0}
                            boxHeight={box.height}
                            variableIds={box.variables}
                            splitVariable={variableId => this.splitVariable(index, variableId)}
                            panelWidth={panelWidth}
                            duration={duration}
                            currentTime={currentTime}
                            focus={focus}
                            canBeMerged={canBeMerged}
                            shouldIndicateMerge={shouldIndicateMerge}
                          />
                        }
                      </SortableBox>
                    )
                  })}
                </div>
              </div>
            )
          }}
        </Subscriber>
      </Panel>
    )
  }
}

export default connect((s, op) => {
  const timeline = getTimelineById(s, op.timelineId)
  return {...timeline}
})(Content)
