import {React} from '$src/studio/handy'
import css from './SelectionArea.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import {LEGEND_BAR_WIDTH} from '$studio/AnimationTimelinePanel/AnimationTimelinePanel'
import {svgPaddingY} from '$studio/AnimationTimelinePanel/BoxView'
import {POINT_RECT_EDGE_SIZE} from '$studio/AnimationTimelinePanel/Point'
import {Variables} from '$studio/AnimationTimelinePanel/types'

interface Props {
  variablesContainerRef: $FixMe
  startPos: {x: number; y: number}
  move: {x: number; y: number}
  focus: [number, number]
  duration: number
  panelWidth: number
  boundaries: number[]
  variables: Variables
  applyChanges: Function
  getSelectedPoints: Function
  onEnd: Function
  onMove: Function
  onResize: Function
}

interface State {
  isMovable: boolean
  left: number
  top: number
  right: number
  bottom: number
  offsetLeft: number
  offsetTop: number
  scrollTop: number
  startX: number
  startY: number
  xBeforeDrag: number
  yBeforeDrag: number
  paddedBoundaries: number[]
  limitLeft: number
  limitRight: number
}

class SelectionArea extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const {variablesContainerRef, startPos, boundaries} = props
    const {left, top} = variablesContainerRef.getBoundingClientRect()
    const scrollTop = variablesContainerRef.scrollTop

    const startX = startPos.x - left
    const startY = startPos.y - top
    this.state = {
      isMovable: false,
      left: startX,
      top: startY,
      right: startX,
      bottom: startY,
      offsetLeft: left,
      offsetTop: top,
      scrollTop,
      startX,
      startY,
      paddedBoundaries: this.getPaddedBoundaries(boundaries),
      xBeforeDrag: 0,
      yBeforeDrag: 0,
      limitLeft: 0,
      limitRight: 0,
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.panelWidth !== this.props.panelWidth) {
      this.props.onEnd() // $FixMe
    }
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
  }

  private getPaddedBoundaries(boundaries: number[]): number[] {
    const boundariesCount = boundaries.length - 1
    const halfOfSvgPaddingY = svgPaddingY / 2
    return boundaries.reduce(
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
  }

  private mouseMoveHandler = (e: MouseEvent) => {
    const {clientX, clientY} = e
    const {offsetLeft, offsetTop, startX, startY} = this.state

    const x = clientX - offsetLeft
    const y = clientY - offsetTop
    const [left, right] = x < startX ? [x, startX] : [startX, x]
    const [top, bottom] = y < startY ? [y, startY] : [startY, y]

    this.setState(() => ({left, top, right, bottom}))
    this.props.onResize(this.getBoxBoundaries())
  }

  private mouseUpHandler = () => {
    const selectedPoints = this.props.getSelectedPoints()

    if (Object.keys(selectedPoints).length > 0) {
      const pointsBoundaries = this.getBoundariesOfSelectedPoints(
        selectedPoints,
      )
      const limits = this.getSelectedPointsHorizontalLimits(selectedPoints)
      this.setState(() => ({
        isMovable: true,
        ...pointsBoundaries,
        limitLeft: limits.left,
        limitRight: limits.right,
      }))
    } else {
      this.props.onEnd()
    }

    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
  }

  private getBoxBoundaries() {
    const {props, state} = this
    const {focus, duration, panelWidth} = props
    const {scrollTop, paddedBoundaries} = state

    const fromX = state.left
    const fromY = state.top + scrollTop
    const dX = state.right - state.left
    const dY = state.bottom - state.top

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

  private getBoundariesOfSelectedPoints(points: $FixMe) {
    const {focus, duration, panelWidth} = this.props
    const {scrollTop, paddedBoundaries} = this.state

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

    const leftOffset = 100 * focus[0] / duration
    const focusedWidth = (focus[1] - focus[0]) / duration
    const left =
      LEGEND_BAR_WIDTH -
      POINT_RECT_EDGE_SIZE / 2 +
      (Math.min(...arrayOfPointTimes) - leftOffset) /
        focusedWidth *
        panelWidth /
        100
    const right =
      LEGEND_BAR_WIDTH +
      POINT_RECT_EDGE_SIZE / 2 +
      (Math.max(...arrayOfPointTimes) - leftOffset) /
        focusedWidth *
        panelWidth /
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
      scrollTop -
      POINT_RECT_EDGE_SIZE / 2

    const bottom =
      paddedBoundaries[bottomBoundaryBoxIndex * 2] +
      Math.max(...arrayOfBottomBoxValues) /
        100 *
        (paddedBoundaries[bottomBoundaryBoxIndex * 2 + 1] -
          paddedBoundaries[bottomBoundaryBoxIndex * 2]) -
      scrollTop +
      POINT_RECT_EDGE_SIZE / 2

    return {left, top, right, bottom}
  }

  private getSelectedPointsHorizontalLimits(
    points: $FixMe,
  ): {right: number; left: number} {
    const {focus, panelWidth, variables} = this.props

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
      left: leftLimit / (focus[1] - focus[0]) * panelWidth,
      right: rightLimit / (focus[1] - focus[0]) * panelWidth,
    }
  }

  private dragHandler = (x: number, y: number, e: MouseEvent) => {
    const {xBeforeDrag, yBeforeDrag, limitLeft, limitRight} = this.state
    let dx = x + xBeforeDrag
    let dy = y + yBeforeDrag
    if (e.altKey) dy = this.props.move.y
    if (e.shiftKey) dx = this.props.move.x

    if (dx <= limitLeft) dx = limitLeft + 1
    if (dx >= limitRight) dx = limitRight - 1

    this.props.onMove({x: dx, y: dy})
  }

  private dragStartHandler = () => {
    const {move: {x, y}} = this.props
    this.setState(() => ({
      xBeforeDrag: x,
      yBeforeDrag: y,
    }))
  }

  private clickOutsideHandler = () => {
    this.props.applyChanges()
    this.props.onEnd()
  }

  render() {
    const {move} = this.props
    const {left, top, right, bottom, isMovable} = this.state

    const width = right - left
    const height = bottom - top
    return (
      <div className={css.container} onClick={this.clickOutsideHandler}>
        <DraggableArea
          shouldRegisterEvents={isMovable}
          onDragStart={this.dragStartHandler}
          onDrag={this.dragHandler}
        >
          <div
            style={{
              transform: `translate3d(
              ${move.x}px,
              ${move.y}px,
              0)`,
            }}
          >
            <div
              className={cx(css.selection, {
                [css.shrink]: isMovable,
              })}
              style={{left, top, width, height}}
              onClick={e => {
                e.stopPropagation()
              }}
            />
          </div>
        </DraggableArea>
      </div>
    )
  }
}

export default SelectionArea
