import {React, connect} from '$src/studio/handy'
import {
  reduceStateAction,
  multiReduceStateAction,
} from '$shared/utils/redux/commonActions'
import generateUniqueId from 'uuid/v4'
import css from './AnimationTimelinePanel.css'
import VariablesBox from './VariablesBox'
import TimeBar from './TimeBar'
import {Subscriber, Broadcast} from 'react-broadcast'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import cx from 'classnames'
import * as _ from 'lodash'
import {set} from 'lodash/fp'
import {
  PanelWidthChannel,
  PanelActiveModeChannel,
  default as Panel,
} from '$src/studio/workspace/components/Panel/Panel'
import {MODE_SHIFT} from '$src/studio/workspace/components/StudioUI/StudioUI'

import {
  BoxID,
  BoxesObject,
  LayoutArray,
  TimelineObject,
} from '$src/studio/AnimationTimelinePanel/types'
import {XY} from '$src/studio/workspace/types'
import StudioComponent from '$src/studio/handy/StudioComponent'
import boxAtom, {BoxAtom} from '$src/shared/DataVerse/atoms/box'
import TimelineInstance from '$studio/componentModel/react/makeReactiveComponent/TimelineInstance/TimelineInstance'
import {IStudioStoreState} from '$studio/types'
import {svgPaddingY} from '$studio/AnimationTimelinePanel/BoxView'
import SelectionArea from '$studio/AnimationTimelinePanel/SelectionArea'
import {POINT_RECT_EDGE_SIZE} from '$studio/AnimationTimelinePanel/Point'

type OwnProps = TimelineObject & {
  pathToTimeline: string[]
  panelDimensions: XY
  elementId?: number
}

type Props = OwnProps

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
  selectionStatus: 'NONE' | 'ACTIVE' | 'CONFIRMED'
  selectionSize: {x: number; y: number}
  selectionMove: {x: number; y: number}
  selectionLimits: null | {right: number; left: number}
  selectionProps:
    | undefined
    | null
    | {
        containerScrollTop: number
        paddedBoundaries: number[]
        _clientX: number
        _clientY: number
        fromX: number
        fromY: number
      }
  moveRatios: number[]
  boundaries: number[]
  duration: number
  focus: [number, number]
  thingy?: string
  timeBox?: BoxAtom<number>
  untapFromTimeBoxChanges?: () => void
  isSeekerBeingDragged: boolean
  timelineInstance: undefined | TimelineInstance
}

const LEGEND_BAR_WIDTH = 30

class Content extends StudioComponent<Props, State> {
  panelWidth: number
  container: $FixMe
  variablesContainer: $FixMe
  selectedPoints: $FixMe = {}
  extremumsOfVariablesInSelection: $FixMe = {}
  currentTTimeXBeforeDrag: BoxAtom<number>

  static panelName = 'AnimationTimeline'

  static panelConfig = {
    headerLess: true,
  }

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)

    const {boxes, layout} = props

    this.state = {
      boxBeingDragged: null,
      selectionStatus: 'NONE',
      selectionSize: {x: 0, y: 0},
      selectionMove: {x: 0, y: 0},
      selectionLimits: null,
      selectionProps: null,
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
      duration: 20000,
      focus: [0, 8000],
      isSeekerBeingDragged: false,
      timelineInstance: undefined,
    }
    this.currentTTimeXBeforeDrag = boxAtom(0)
  }

  componentDidMount() {
    document.addEventListener('keypress', (e: $FixMe): void | false => {
      if (e.target.tagName !== 'INPUT' && e.keyCode === 32) {
        e.preventDefault()
        return false
      }
    })

    const {duration, focus} = this.state
    const svgWidth =
      duration / (focus[1] - focus[0]) * (this.container.clientWidth - 30)
    setTimeout(() => {
      this.variablesContainer.scrollTo(svgWidth * focus[0] / duration, 0)
    }, 0)

    window.addEventListener('keypress', this._handleKeyPress)
  }

  componentWillReceiveProps(newProps: IProps) {
    if (JSON.stringify(newProps.layout) !== JSON.stringify(this.props.layout)) {
      this._resetBoundariesAndRatios(newProps.layout, newProps.boxes)
    }

    this._updateThingy(newProps)
  }

  _updateThingy(props: Props = this.props) {
    const thingy = calculateThingy(props.elementId, props.pathToTimeline)
    if (thingy === this.state.thingy) return

    if (this.state.untapFromTimeBoxChanges) {
      this.state.untapFromTimeBoxChanges()
    }

    if (props.elementId && props.pathToTimeline) {
      const timelineId = props.pathToTimeline[props.pathToTimeline.length - 1]
      const element = this.studio.componentInstances.get(props.elementId)
      const timelineInstance = element.getTimelineInstance(timelineId)
      const timeBox = timelineInstance.atom.prop('time')
      const untapFromTimeBoxChanges = timeBox.changes().tap(() => {})

      this.setState({
        thingy,
        timeBox,
        timelineInstance,
        untapFromTimeBoxChanges,
        currentTTime: timeBox.getValue(),
      })
    }
  }

  _updateTimeState = () => {}

  _handleKeyPress = (e: React.KeyboardEvent<$FixMe>) => {
    // if (keyCode)
    if (e.keyCode === 32 && e.target === document.body) {
      if (this.state.thingy) {
        this.state.timelineInstance.togglePlay()
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this._handleKeyPress)
  }

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

  onBoxStartMove = (index: number) => {
    document.body.classList.add('globalMoveCursor')

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

  onBoxEndMove = () => {
    document.body.classList.remove('globalMoveCursor')
    if (this.state.boxBeingDragged == null) return
    const {index, moveTo, mergeWith} = this.state.boxBeingDragged
    const {dispatch} = this.props
    if (moveTo != null) {
      dispatch(
        reduceStateAction([...this.props.pathToTimeline, 'layout'], layout => {
          const newLayout = layout.slice()
          newLayout.splice(moveTo, 0, newLayout.splice(index, 1)[0])
          return newLayout
        }),
      )
    } else if (mergeWith != null) {
      dispatch(
        reduceStateAction(this.props.pathToTimeline, timelineObj => {
          const {layout, boxes} = timelineObj
          const fromId = layout[index]
          const toId = layout[mergeWith]

          const newLayout = layout.slice()
          newLayout.splice(index, 1)

          const {[fromId]: mergedBox, ...newBoxes} = boxes
          newBoxes[toId].variables = newBoxes[toId].variables.concat(
            mergedBox.variables,
          )

          return {
            ...timelineObj,
            layout: newLayout,
            boxes: newBoxes,
          }
        }),
      )
    }

    this.setState(() => {
      return {
        boxBeingDragged: null,
      }
    })
  }

  splitVariable = (index: number, variableId: string) => {
    const {dispatch} = this.props
    dispatch(
      reduceStateAction(
        this.props.pathToTimeline,
        ({layout, boxes, ...restOfTimeline}) => {
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
            ...restOfTimeline,
            layout: newLayout,
            boxes: newBoxes,
          }
        },
      ),
    )
  }

  onBoxResize = (boxId: BoxID, newHeight: number) => {
    const {dispatch} = this.props
    dispatch(
      reduceStateAction(
        [...this.props.pathToTimeline, 'boxes', boxId, 'height'],
        () => newHeight,
      ),
    )
    const boxes = {
      ...this.props.boxes,
      [boxId]: {
        ...this.props.boxes[boxId],
        height: newHeight,
      },
    }
    this._resetBoundariesAndRatios(this.props.layout, boxes)
  }

  changeFocusRightTo = (newFocusRight: number) => {
    const {focus, duration} = this.state
    if (newFocusRight > duration) newFocusRight = duration
    if (newFocusRight - focus[0] < 1000) newFocusRight = focus[0] + 1000

    this.changeFocusTo(focus[0], newFocusRight)
  }

  changeFocusLeftTo = (newFocusLeft: number) => {
    const {focus} = this.state
    if (newFocusLeft < 0) newFocusLeft = 0
    if (focus[1] - newFocusLeft < 1000) newFocusLeft = focus[1] - 1000

    this.changeFocusTo(newFocusLeft, focus[1])
  }

  _changeZoomLevel = (newFocusLeft: number, newFocusRight: number) => {
    const {duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
    }
    if (newFocusRight > duration) {
      newFocusRight = duration
    }
    if (newFocusRight - newFocusLeft < 1) return

    this.setState(() => ({focus: [newFocusLeft, newFocusRight]}))
  }

  changeFocusTo = (newFocusLeft: number, newFocusRight: number) => {
    const {focus, duration} = this.state
    if (newFocusLeft < 0) {
      newFocusLeft = 0
      newFocusRight = focus[1] - focus[0]
    }
    if (newFocusRight > duration) {
      newFocusLeft = duration - (focus[1] - focus[0])
      newFocusRight = duration
    }

    this.setState(() => ({focus: [newFocusLeft, newFocusRight]}))
  }

  changeCurrentTimeTo = (currentTTime: number) => {
    if (this.state.timeBox) {
      this.state.timeBox.set(_.clamp(currentTTime, 0, this.state.duration))
    }
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
    if (this.state.timeBox) {
      this.state.timeBox.set(newCurrentTime)
    }
    this.setState(() => ({
      // currentTime: newCurrentTime,
      duration: newDuration,
      focus: newFocus,
    }))
  }

  _changeCurrentTime(newTime: number) {
    if (this.timelineInstance) {
      this.timelineInstance.atom.prop('time').set(newTime)
    }
  }

  _getScrollLeft(
    duration: number,
    focusLeft: number,
    focusRight: number,
    panelWidth: number,
  ) {
    const svgWidth = duration / (focusRight - focusLeft) * panelWidth
    return -svgWidth * focusLeft / duration
  }

  _handleScroll(e: React.WheelEvent<$FixMe>, panelWidth: number) {
    const isHorizontal = Math.abs(e.deltaY) < Math.abs(e.deltaX)

    if (e.ctrlKey || (e.shiftKey && !isHorizontal)) {
      if (e.nativeEvent.target !== this.variablesContainer) {
        e.preventDefault()
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
        )
      }
      return
    }

    if (isHorizontal) {
      e.preventDefault()
      const {focus} = this.state
      const change = e.deltaX / panelWidth * (focus[1] - focus[0])
      this.changeFocusTo(focus[0] + change, focus[1] + change)
    }
  }

  _handleSeekerDragStart = (
    e: $FixMe,
    focus: [number, number],
    panelWidth: number,
  ) => {
    this._addGlobalCursorRule()
    const newTime = this.xToFocusedTime(e.nativeEvent.layerX, focus, panelWidth)
    this.currentTTimeXBeforeDrag.set(
      this.focusedTimeToX(newTime, focus, panelWidth),
    )
    this.setState(() => ({
      isSeekerBeingDragged: true,
      // currentTimeXBeforeDrag: this.focusedTimeToX(newTime, focus, panelWidth),
    }))
    this.changeCurrentTimeTo(newTime)
  }

  _handleSeekerDragEnd = () => {
    this._removeGlobalCursorRule()
    this.setState(() => ({isSeekerBeingDragged: false}))
  }

  _handleModifierDrop = () => {
    const {props} = this
    if (props.panelObjectBeingDragged == null) return
    const {prop} = props.panelObjectBeingDragged
    const timelineId = props.pathToTimeline[props.pathToTimeline.length - 1]
    const varId = generateUniqueId()
    let componentName
    this.dispatch(
      multiReduceStateAction([
        {
          path: props.activeComponentPath,
          reducer: theaterObj => {
            componentName = `${theaterObj.componentId.split('/').slice(-1)}.${
              theaterObj.props.class
            }`
            const {modifierInstantiationDescriptors: modifiers} = theaterObj
            const uberModifierId = modifiers.list[0]
            const uberModifier = modifiers.byId[uberModifierId]
            const newProps = {
              ...uberModifier.props,
              [prop]: {
                __descriptorType: 'ReferenceToTimelineVar',
                timelineId,
                varId,
              },
            }
            return set(
              [
                'modifierInstantiationDescriptors',
                'byId',
                uberModifierId,
                'props',
              ],
              newProps,
              theaterObj,
            )
          },
        },
        {
          path: props.pathToTimeline,
          reducer: timelineObj => {
            const variables = {
              ...timelineObj.variables,
              [varId]: {
                __descriptorType: 'TimelineVarDescriptor',
                id: varId,
                component: componentName,
                property: prop,
                extremums: [-10, 10],
                points: [],
              },
            }
            const boxId = generateUniqueId()
            const layout = timelineObj.layout.concat(boxId)
            const boxes = {
              ...timelineObj.boxes,
              [boxId]: {
                id: boxId,
                height: 100,
                variables: [varId],
              },
            }
            return {
              ...timelineObj,
              variables,
              layout,
              boxes,
            }
          },
        },
      ]),
    )
  }

  timeToX(time: number, panelWidth: number) {
    const {duration} = this.state
    return time * panelWidth / duration
  }

  xToTime(x: number, panelWidth: number) {
    const {duration} = this.state
    return x * duration / panelWidth
  }

  focusedTimeToX(time: number, focus: [number, number], panelWidth: number) {
    return (time - focus[0]) / (focus[1] - focus[0]) * panelWidth
  }

  xToFocusedTime(x: number, focus: [number, number], panelWidth: number) {
    return x * (focus[1] - focus[0]) / panelWidth + focus[0]
  }

  _addGlobalCursorRule() {
    document.body.classList.add('animationTimelineSeekerDrag')
  }

  _removeGlobalCursorRule() {
    document.body.classList.remove('animationTimelineSeekerDrag')
  }

  _handleMouseDown = (e: $FixMe, activeMode: string) => {
    if (activeMode === MODE_SHIFT) {
      const {clientX, clientY} = e
      const {left, top} = this.container.getBoundingClientRect()

      const {boundaries} = this.state
      const boundariesCount = boundaries.length - 1
      const halfOfSvgPaddingY = svgPaddingY / 2
      const paddedBoundaries = boundaries.reduce(
        (reducer: number[], boundary: number, index: number) => {
          if (index === 0) {
            return [...reducer, boundary + halfOfSvgPaddingY]
          }
          if (index === boundariesCount) {
            return [...reducer, boundary - halfOfSvgPaddingY]
          }
          return [
            ...reducer,
            boundary - halfOfSvgPaddingY,
            boundary + halfOfSvgPaddingY,
          ]
        },
        [],
      )

      this.setState(() => ({
        selectionStatus: 'ACTIVE',
        selectionProps: {
          containerScrollTop: this.variablesContainer.scrollTop,
          paddedBoundaries,
          _clientX: clientX,
          _clientY: clientY,
          fromX: clientX - left,
          fromY: clientY - top - 1,
        },
      }))
      document.addEventListener('mousemove', this._updateSelectionOnDrag)
      document.addEventListener('mouseup', this._confirmSelection)
    }
  }

  _updateSelectionOnDrag = (e: $FixMe) => {
    const {clientX, clientY} = e
    this.setState(({selectionProps}) => ({
      selectionSize: {
        // @ts-ignore
        x: clientX - selectionProps._clientX,
        // @ts-ignore
        y: clientY - selectionProps._clientY,
      },
    }))
  }

  _confirmSelection = () => {
    document.removeEventListener('mousemove', this._updateSelectionOnDrag)
    document.removeEventListener('mouseup', this._confirmSelection)

    if (Object.keys(this.selectedPoints).length > 0) {
      const {left, top, right, bottom} = this._getSelectedPointsBoundaries(
        this.selectedPoints,
      )
      this.setState(({selectionProps}: $FixMe) => ({
        selectionStatus: 'CONFIRMED',
        selectionProps: {
          ...selectionProps,
          fromX: left,
          fromY: top,
        },
        selectionSize: {
          x: right - left,
          y: bottom - top,
        },
        selectionLimits: {
          ...this._getSelectedPointsHorizontalLimits(this.selectedPoints),
        },
      }))
    } else {
      this.selectedPoints = {}
      this.extremumsOfVariablesInSelection = {}
      this.setState(() => ({
        selectionStatus: 'NONE',
        selectionProps: null,
        selectionSize: {x: 0, y: 0},
        selectionMove: {x: 0, y: 0},
        selectionLimits: null,
      }))
    }
  }

  _applyChangesToSelection = () => {
    const {selectionMove, duration, focus, boundaries} = this.state
    const svgWidth = duration / (focus[1] - focus[0]) * this.panelWidth
    this.props.dispatch(
      reduceStateAction(
        this.props.pathToTimeline.concat('variables'),
        (variables: $FixMe) => {
          Object.keys(this.selectedPoints).forEach((boxKey: string) => {
            const boxInfo = this.selectedPoints[boxKey]
            const boxHeight =
              boundaries[Number(boxKey) + 1] -
              boundaries[Number(boxKey)] -
              svgPaddingY
            Object.keys(boxInfo).forEach((variableKey: string) => {
              const variableInfo = boxInfo[variableKey]
              const extremums = this.extremumsOfVariablesInSelection[
                variableKey
              ]
              const extDiff = extremums[1] - extremums[0]
              Object.keys(variableInfo).forEach((pointKey: string) => {
                const path = [variableKey, 'points', pointKey]
                const pointProps = _.get(variables, path)
                variables = set(
                  path,
                  {
                    ...pointProps,
                    time:
                      pointProps.time + selectionMove.x / svgWidth * duration,
                    value:
                      pointProps.value - selectionMove.y / boxHeight * extDiff,
                  },
                  variables,
                )
              })
            })
          })
          return variables
        },
      ),
    )

    this.setState(() => ({
      selectionStatus: 'NONE',
      selectionProps: null,
      selectionSize: {x: 0, y: 0},
      selectionMove: {x: 0, y: 0},
      selectionLimits: null,
    }))
    setTimeout(() => {
      this.selectedPoints = {}
      this.extremumsOfVariablesInSelection = {}
    }, 0)
  }

  _getSelectedPointsBoundaries(points: $FixMe) {
    const {selectionProps} = this.state
    // @ts-ignore
    const {paddedBoundaries, containerScrollTop} = selectionProps

    let arrayOfPointTimes: number[] = []
    Object.keys(points).forEach((boxKey: string) => {
      const boxInfo = points[boxKey]
      Object.keys(boxInfo).forEach((variableKey: string) => {
        const variableInfo = boxInfo[variableKey]
        Object.keys(variableInfo).forEach((pointKey: string) => {
          arrayOfPointTimes = [
            ...arrayOfPointTimes,
            variableInfo[pointKey].time,
          ]
        })
      })
    })

    const {focus, duration} = this.state
    const leftOffset = 100 * focus[0] / duration
    const focusedWidth = (focus[1] - focus[0]) / duration
    const left =
      LEGEND_BAR_WIDTH -
      POINT_RECT_EDGE_SIZE / 2 +
      (Math.min(...arrayOfPointTimes) - leftOffset) /
        focusedWidth *
        this.panelWidth /
        100
    const right =
      LEGEND_BAR_WIDTH +
      POINT_RECT_EDGE_SIZE / 2 +
      (Math.max(...arrayOfPointTimes) - leftOffset) /
        focusedWidth *
        this.panelWidth /
        100

    const indicesOfBoxesInSelection = Object.keys(points)
      .map(Number)
      .sort()
    const topBoundaryBoxIndex = indicesOfBoxesInSelection[0]
    const bottomBoundaryBoxIndex =
      indicesOfBoxesInSelection[indicesOfBoxesInSelection.length - 1]
    const topBoundaryBox = points[topBoundaryBoxIndex]
    const bottomBoundaryBox = points[bottomBoundaryBoxIndex]
    let arrayOfTopBoxValues: number[] = []
    let arrayOfBottomBoxValues: number[] = []
    Object.keys(topBoundaryBox).forEach((variableKey: string) => {
      const variableInfo = topBoundaryBox[variableKey]
      Object.keys(variableInfo).forEach((pointKey: string) => {
        arrayOfTopBoxValues = [
          ...arrayOfTopBoxValues,
          variableInfo[pointKey].value,
        ]
      })
    })
    Object.keys(bottomBoundaryBox).forEach((variableKey: string) => {
      const variableInfo = bottomBoundaryBox[variableKey]
      Object.keys(variableInfo).forEach((pointKey: string) => {
        arrayOfBottomBoxValues = [
          ...arrayOfBottomBoxValues,
          variableInfo[pointKey].value,
        ]
      })
    })

    const top =
      paddedBoundaries[topBoundaryBoxIndex * 2] +
      Math.min(...arrayOfTopBoxValues) /
        100 *
        (paddedBoundaries[topBoundaryBoxIndex * 2 + 1] -
          paddedBoundaries[topBoundaryBoxIndex * 2]) -
      containerScrollTop -
      POINT_RECT_EDGE_SIZE / 2

    const bottom =
      paddedBoundaries[bottomBoundaryBoxIndex * 2] +
      Math.max(...arrayOfBottomBoxValues) /
        100 *
        (paddedBoundaries[bottomBoundaryBoxIndex * 2 + 1] -
          paddedBoundaries[bottomBoundaryBoxIndex * 2]) -
      containerScrollTop +
      POINT_RECT_EDGE_SIZE / 2

    return {left, top, right, bottom}
  }

  _getSelectedPointsHorizontalLimits(points: $FixMe): {right: number, left: number} {
    const {variables} = this.props
    const {focus} = this.state

    let leftLimit = -Infinity
    let rightLimit = Infinity
    Object.keys(points).forEach((boxKey: string) => {
      const selectedBox = points[boxKey]
      Object.keys(selectedBox).forEach((variableKey: string) => {
        const {points: variablePoints} = variables[variableKey]
        const selectedPointsKeys = Object.keys(selectedBox[variableKey]).map(
          Number,
        )
        selectedPointsKeys.forEach((pointIndex: number) => {
          const point = variablePoints[pointIndex]
          const prevIndex = pointIndex - 1
          const nextIndex = pointIndex + 1

          if (!selectedPointsKeys.includes(prevIndex)) {
            const prevPoint = variablePoints[prevIndex]
            if (prevPoint != null) {
              leftLimit = Math.max(leftLimit, prevPoint.time - point.time)
            } else {
              leftLimit = Math.max(leftLimit, -point.time)
            }
          }
          if (!selectedPointsKeys.includes(nextIndex)) {
            const nextPoint = variablePoints[nextIndex]
            if (nextPoint != null) {
              rightLimit = Math.min(rightLimit, nextPoint.time - point.time)
            } else {
              rightLimit = Math.min(rightLimit, focus[1] - point.time)
            }
          }
        })
      })
    })
    return {
      left: leftLimit / (focus[1] - focus[0]) * this.panelWidth,
      right: rightLimit / (focus[1] - focus[0]) * this.panelWidth,
    }
  }

  _getSelectionBoundaries(panelWidth: number) {
    if (this.state.selectionProps == null) return null

    const {focus, duration, selectionSize, selectionProps} = this.state
    const {paddedBoundaries, containerScrollTop} = selectionProps
    let {fromY, fromX} = selectionProps
    let {x: dX, y: dY} = selectionSize
    fromY += containerScrollTop
    if (dY < 0) {
      dY = -dY
      fromY = fromY - dY
    }
    if (dX < 0) {
      dX = -dX
      fromX = fromX - dX
    }

    const fromIndex = paddedBoundaries.findIndex((b: number) => b > fromY) - 1
    let toIndex = paddedBoundaries.findIndex((b: number) => b >= fromY + dY)
    if (toIndex === -1) toIndex = paddedBoundaries.length - 1

    const topBoundaryBoxIndex =
      fromIndex % 2 === 0 ? fromIndex / 2 : Math.ceil(fromIndex / 2)
    const bottomBoundaryBoxIndex =
      toIndex % 2 === 0 ? toIndex / 2 : Math.floor(toIndex / 2)

    const leftOffset = focus[0] / duration
    const focusedWidth = (focus[1] - focus[0]) / duration
    const left =
      100 *
      (leftOffset + focusedWidth * ((fromX - LEGEND_BAR_WIDTH) / panelWidth))
    const right =
      100 *
      (leftOffset +
        focusedWidth * ((fromX + dX - LEGEND_BAR_WIDTH) / panelWidth))

    let boxesBoundaries
    if (topBoundaryBoxIndex === bottomBoundaryBoxIndex) {
      const topBoundary = paddedBoundaries[topBoundaryBoxIndex * 2]
      const bottomBoundary = paddedBoundaries[bottomBoundaryBoxIndex * 2 + 1]
      const boxHeight = bottomBoundary - topBoundary
      boxesBoundaries = {
        [topBoundaryBoxIndex]: {
          left,
          right,
          top: (fromY - topBoundary) / boxHeight * 100,
          bottom: (fromY + dY - topBoundary) / boxHeight * 100,
        },
      }
    } else {
      const fromBoxTopBoundary = paddedBoundaries[topBoundaryBoxIndex * 2]
      const fromBoxHeight =
        paddedBoundaries[topBoundaryBoxIndex * 2 + 1] - fromBoxTopBoundary
      const toBoxTopBoundary = paddedBoundaries[bottomBoundaryBoxIndex * 2]
      const toBoxHeight =
        paddedBoundaries[bottomBoundaryBoxIndex * 2 + 1] - toBoxTopBoundary
      const fromBoxBoundaries = {
        left,
        right,
        top: 100 * (fromY - fromBoxTopBoundary) / fromBoxHeight,
        bottom: 100,
      }
      const toBoxBoundaries = {
        left,
        right,
        top: 0,
        bottom: 100 * (fromY + dY - toBoxTopBoundary) / toBoxHeight,
      }

      boxesBoundaries = {
        [topBoundaryBoxIndex]: fromBoxBoundaries,
        [bottomBoundaryBoxIndex]: toBoxBoundaries,
        ...Array.from(
          Array(bottomBoundaryBoxIndex - topBoundaryBoxIndex - 1),
          (_, i: number) => i + topBoundaryBoxIndex + 1,
        ).reduce((reducer: Object, n: number) => {
          return {
            ...reducer,
            [n]: {
              left,
              right,
              top: 0,
              bottom: 100,
            },
          }
        }, {}),
      }
    }
    return boxesBoundaries
  }

  addPointToSelection = (
    boxIndex: number,
    variableId: string,
    variableExtremums: Object,
    pointIndex: number,
    pointData: Object,
  ) => {
    const boxInfo = this.selectedPoints[boxIndex] || {}
    const variableInfo = boxInfo[variableId] || {}

    this.extremumsOfVariablesInSelection = {
      ...this.extremumsOfVariablesInSelection,
      [variableId]: variableExtremums,
    }
    this.selectedPoints = {
      ...this.selectedPoints,
      [boxIndex]: {
        ...boxInfo,
        [variableId]: {
          ...variableInfo,
          [pointIndex]: pointData,
        },
      },
    }
  }

  removePointFromSelection = (
    boxIndex: number,
    variableId: string,
    pointIndex: number,
  ) => {
    const {[boxIndex]: boxInfo, ...otherBoxes} = this.selectedPoints
    const {[variableId]: variableInfo, ...otherVariables} = boxInfo
    // // @ts-ignore
    const {[pointIndex]: pointInfo, ...otherPoints} = variableInfo

    if (Object.keys(otherPoints).length > 0) {
      this.selectedPoints = {
        ...otherBoxes,
        [boxIndex]: {
          ...otherVariables,
          [variableId]: {
            ...otherPoints,
          },
        },
      }
    } else {
      if (Object.keys(otherVariables).length > 0) {
        this.selectedPoints = {
          ...otherBoxes,
          [boxIndex]: {...otherVariables},
        }
      } else {
        this.selectedPoints = {...otherBoxes}
      }
    }
  }

  render() {
    const {
      boxBeingDragged,
      moveRatios,
      duration,
      focus,
      // currentTTime: currentTime,
      selectionStatus,
      selectionSize,
      selectionProps,
      selectionLimits,
    } = this.state
    const {boxes, layout, panelObjectBeingDragged} = this.props

    const isABoxBeingDragged = boxBeingDragged != null

    return (
      <Panel
        headerLess={true}
        css={{
          container: css.panelContainer,
          innerWrapper: css.panelInnerWrapper,
        }}
      >
        <Subscriber channel={PanelWidthChannel}>
          {({width: panelWidth}: $FixMe) => {
            panelWidth -= LEGEND_BAR_WIDTH
            this.panelWidth = panelWidth
            const svgWidth: number = Math.floor(
              duration / Math.floor(focus[1] - focus[0]) * panelWidth,
            )
            const scrollLeft = this._getScrollLeft(
              duration,
              focus[0],
              focus[1],
              panelWidth,
            )
            const selectionBoundaries =
              selectionStatus !== 'NONE'
                ? this._getSelectionBoundaries(panelWidth)
                : null
            return (
              <Subscriber channel={PanelActiveModeChannel}>
                {({activeMode}) => {
                  return (
                    <div
                      ref={c => (this.container = c)}
                      className={cx(css.container, {
                        [css.showModifierDropOverlay]:
                          panelObjectBeingDragged &&
                          panelObjectBeingDragged.type === 'modifier',
                      })}
                      onWheel={e => this._handleScroll(e, panelWidth)}
                      onMouseDown={e => this._handleMouseDown(e, activeMode)}
                      onMouseUp={this._handleModifierDrop}
                    >
                      <div className={css.timeBar}>
                        <TimeBar
                          shouldIgnoreMouse={this.state.isSeekerBeingDragged}
                          panelWidth={panelWidth}
                          duration={duration}
                          // currentTime={currentTime}
                          timeBox={this.state.timeBox}
                          focus={focus}
                          timeToX={(time: number) =>
                            this.timeToX(time, panelWidth)
                          }
                          xToTime={(x: number) => this.xToTime(x, panelWidth)}
                          focusedTimeToX={(
                            time: number,
                            focus: [number, number],
                          ) => this.focusedTimeToX(time, focus, panelWidth)}
                          xToFocusedTime={(
                            x: number,
                            focus: [number, number],
                          ) => this.xToFocusedTime(x, focus, panelWidth)}
                          changeFocusTo={(
                            focusLeft: number,
                            focusRight: number,
                          ) => this.changeFocusTo(focusLeft, focusRight)}
                          changeFocusRightTo={(focus: number) =>
                            this.changeFocusRightTo(focus)
                          }
                          changeFocusLeftTo={(focus: number) =>
                            this.changeFocusLeftTo(focus)
                          }
                          changeCurrentTimeTo={this.changeCurrentTimeTo}
                          changeDuration={this.changeDuration}
                        />
                      </div>
                      <DraggableArea
                        shouldRegisterEvents={activeMode !== MODE_SHIFT}
                        onDragStart={(e: $FixMe) =>
                          this._handleSeekerDragStart(e, focus, panelWidth)
                        }
                        onDrag={(dx: number) =>
                          this.changeCurrentTimeTo(
                            this.xToFocusedTime(
                              // this.state.currentTimeXBeforeDrag + dx, focus, panelWidth
                              this.currentTTimeXBeforeDrag.getValue() + dx,
                              focus,
                              panelWidth,
                            ),
                          )
                        }
                        onDragEnd={this._handleSeekerDragEnd}
                      >
                        <div
                          ref={c => (this.variablesContainer = c)}
                          className={css.variables}
                        >
                          <Broadcast
                            channel={'selectionMove'}
                            value={this.state.selectionMove}
                          >
                            <div>
                              {layout.map((id, index) => {
                                const box = boxes[id]
                                const boxTranslateY =
                                  moveRatios[index] *
                                  (isABoxBeingDragged
                                    ? boxBeingDragged.height
                                    : 0)
                                const canBeMerged =
                                  isABoxBeingDragged &&
                                  boxBeingDragged.index === index &&
                                  boxBeingDragged.mergeWith != null
                                const shouldIndicateMerge =
                                  isABoxBeingDragged &&
                                  boxBeingDragged.mergeWith !== null &&
                                  boxBeingDragged.mergeWith === index
                                let height = box.height
                                return (
                                  <VariablesBox
                                    key={id}
                                    boxIndex={index}
                                    boxId={id}
                                    activeMode={activeMode}
                                    translateY={boxTranslateY}
                                    svgHeight={height}
                                    svgWidth={svgWidth}
                                    variableIds={box.variables}
                                    splitVariable={this.splitVariable}
                                    duration={duration}
                                    canBeMerged={canBeMerged}
                                    shouldIndicateMerge={shouldIndicateMerge}
                                    pathToTimeline={this.props.pathToTimeline}
                                    scrollLeft={scrollLeft}
                                    isABoxBeingDragged={isABoxBeingDragged}
                                    onMoveStart={this.onBoxStartMove}
                                    onMoveEnd={this.onBoxEndMove}
                                    onMove={this.onBoxMove}
                                    onResize={this.onBoxResize}
                                    addPointToSelection={
                                      this.addPointToSelection
                                    }
                                    removePointFromSelection={
                                      this.removePointFromSelection
                                    }
                                    {...(selectionBoundaries != null
                                      ? {
                                          selectionBoundaries:
                                            selectionBoundaries[index],
                                        }
                                      : {})}
                                  />
                                )
                              })}
                            </div>
                          </Broadcast>
                        </div>
                      </DraggableArea>
                      <SelectionArea
                        status={selectionStatus}
                        {...(selectionStatus != 'NONE'
                          ? {
                              // @ts-ignore
                              left: selectionProps.fromX,
                              // @ts-ignore
                              top: selectionProps.fromY,
                              width: selectionSize.x,
                              height: selectionSize.y,
                            }
                          : {})}
                        leftLimit={selectionLimits != null ? selectionLimits.left : null}
                        rightLimit={selectionLimits != null ? selectionLimits.right : null}
                        move={this.state.selectionMove}
                        onMove={(x: number, y: number) =>
                          this.setState(() => ({selectionMove: {x, y}}))
                        }
                        onEnd={this._applyChangesToSelection}
                      />
                    </div>
                  )
                }}
              </Subscriber>
            )
          }}
        </Subscriber>
      </Panel>
    )
  }
}

export default connect((s: IStudioStoreState, op: OwnProps) => {
  const timeline = _.get(s, op.pathToTimeline)
  const panelObjectBeingDragged = _.get(s, [
    'workspace',
    'panels',
    'panelObjectBeingDragged',
  ])
  const selectedComponentId = _.get(s, [
    'workspace',
    'panels',
    'byId',
    'elementTree',
    'outputs',
    'selectedNode',
    'componentId',
  ])
  const selectedElementId = _.get(s, [
    'componentModel',
    'componentDescriptors',
    'custom',
    selectedComponentId,
    'meta',
    'composePanel',
    'selectedNodeId',
  ])
  const activeComponentPath = [
    'componentModel',
    'componentDescriptors',
    'custom',
    selectedComponentId,
    'localHiddenValuesById',
    selectedElementId,
  ]
  return {...timeline, panelObjectBeingDragged, activeComponentPath}
})(Content)

function calculateThingy(elementId?: number, pathToTimeline?: string[]) {
  if (!elementId || !pathToTimeline) {
    return undefined
  } else {
    return JSON.stringify({elementId, pathToTimeline})
  }
}
