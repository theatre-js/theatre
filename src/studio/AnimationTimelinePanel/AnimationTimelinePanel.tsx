import {
  React,
  connect,
  reduceStateAction,
  multiReduceStateAction,
} from '$src/studio/handy'
import generateUniqueId from 'uuid/v4'
import css from './AnimationTimelinePanel.css'
import VariablesBox from './VariablesBox'
import TimeBar from './TimeBar'
import {Subscriber} from 'react-broadcast'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import cx from 'classnames'
import * as _ from 'lodash'
import {set} from 'lodash/fp'
import {
  PanelWidthChannel,
  default as Panel,
} from '$src/studio/workspace/components/Panel/Panel'

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
import {IStoreState} from '$studio/types'

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
  moveRatios: number[]
  boundaries: number[]
  duration: number
  focus: [number, number]
  thingy?: string
  timeBox?: BoxAtom<number>
  untapFromTimeBoxChanges?: () => void
  isSeekerBeingDragged: boolean
  timelineInstance: undefined | TimelineInstance
  scrollLeft: number
}

class Content extends StudioComponent<Props, State> {
  variablesContainer: any
  static panelName = 'AnimationTimeline'

  currentTTimeXBeforeDrag: BoxAtom<number>
  static panelConfig = {
    headerLess: true,
  }

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)

    const {boxes, layout} = props

    this.state = {
      boxBeingDragged: null,
      moveRatios: new Array(layout.length).fill(0),
      boundaries: this._getBoundaries(boxes, layout),
      duration: 20000,
      focus: [0, 8000],
      isSeekerBeingDragged: false,
      timelineInstance: undefined,
      scrollLeft: 0,
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
      }
    }
    this._resetBoundariesAndRatios(this.props.layout, boxes)
  }

  changeFocusRightTo = (newFocusRight: number, panelWidth: number) => {
    const {focus, duration} = this.state
    if (newFocusRight > duration) newFocusRight = duration
    if (newFocusRight - focus[0] < 1000) newFocusRight = focus[0] + 1000

    this.changeFocusTo(focus[0], newFocusRight, panelWidth)
  }

  changeFocusLeftTo = (newFocusLeft: number, panelWidth: number) => {
    const {focus} = this.state
    if (newFocusLeft < 0) newFocusLeft = 0
    if (focus[1] - newFocusLeft < 1000) newFocusLeft = focus[1] - 1000

    this.changeFocusTo(newFocusLeft, focus[1], panelWidth)
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

    this.setState(() => ({
      focus: [newFocusLeft, newFocusRight],
      scrollLeft: this._getScrollLeft(
        duration,
        newFocusLeft,
        newFocusRight,
        panelWidth,
      ),
    }))
  }

  changeFocusTo = (
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

    this.setState(() => ({
      focus: [newFocusLeft, newFocusRight],
      scrollLeft: this._getScrollLeft(
        duration,
        newFocusLeft,
        newFocusRight,
        panelWidth,
      ),
    }))
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
          panelWidth,
        )
      }
      return
    }

    if (isHorizontal) {
      e.preventDefault()
      const {focus} = this.state
      const change = e.deltaX / panelWidth * (focus[1] - focus[0])
      this.changeFocusTo(focus[0] + change, focus[1] + change, panelWidth)
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

  render() {
    const {
      boxBeingDragged,
      moveRatios,
      duration,
      focus,
      // currentTTime: currentTime,
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
            panelWidth -= 30
            const svgWidth: number = Math.floor(
              duration / Math.floor(focus[1] - focus[0]) * panelWidth,
            )
            return (
              <div
                ref={c => (this.container = c)}
                className={cx(css.container, {
                  [css.showModifierDropOverlay]:
                    panelObjectBeingDragged &&
                    panelObjectBeingDragged.type === 'modifier',
                })}
                onWheel={e => this._handleScroll(e, panelWidth)}
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
                    timeToX={(time: number) => this.timeToX(time, panelWidth)}
                    xToTime={(x: number) => this.xToTime(x, panelWidth)}
                    focusedTimeToX={(time: number, focus: [number, number]) =>
                      this.focusedTimeToX(time, focus, panelWidth)
                    }
                    xToFocusedTime={(x: number, focus: [number, number]) =>
                      this.xToFocusedTime(x, focus, panelWidth)
                    }
                    changeFocusTo={(focusLeft: number, focusRight: number) =>
                      this.changeFocusTo(focusLeft, focusRight, panelWidth)
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
                <DraggableArea
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
                    <div>
                      {layout.map((id, index) => {
                        const box = boxes[id]
                        const boxTranslateY =
                          moveRatios[index] *
                          (isABoxBeingDragged ? boxBeingDragged.height : 0)
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
                            translateY={boxTranslateY}
                            svgHeight={height}
                            svgWidth={svgWidth}
                            variableIds={box.variables}
                            splitVariable={this.splitVariable}
                            duration={duration}
                            canBeMerged={canBeMerged}
                            shouldIndicateMerge={shouldIndicateMerge}
                            pathToTimeline={this.props.pathToTimeline}
                            scrollLeft={this.state.scrollLeft}
                            isABoxBeingDragged={isABoxBeingDragged}
                            onMoveStart={this.onBoxStartMove}
                            onMoveEnd={this.onBoxEndMove}
                            onMove={this.onBoxMove}
                            onResize={this.onBoxResize}
                          />
                        )
                      })}
                    </div>
                  </div>
                </DraggableArea>
              </div>
            )
          }}
        </Subscriber>
      </Panel>
    )
  }
}

export default connect((s: IStoreState, op: OwnProps) => {
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
