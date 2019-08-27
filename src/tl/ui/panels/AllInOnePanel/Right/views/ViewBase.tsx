import React from 'react'
import {IWithUtilsProps} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import UIComponent from '$tl/ui/handy/UIComponent'
import {
  IExtremums,
  INormalizedPoints,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  IShowPointContextMenu,
  IShowPointValuesEditor,
  IMovePointToNewCoords,
  IShowConnectorContextMenu,
  IAddPointToSelection,
  IRemovePointFromSelection,
  IMovePointToNewCoordsTemp,
  IGetAllPoints,
  ITempPointRenderer,
  ITempPointsInSelection,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {SelectionStatusContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import RenderBlocker from '$shared/components/RenderBlocker/RenderBlocker'
import {ICollectionOfSelectedPointsData} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {
  getTimeNormalizer,
  getValueNormalizer,
  calculateNextExtremums,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'
import {roundestNumberBetween} from '$shared/utils/numberRoundingUtils'
import {FRAME_DURATION} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'

export interface IViewBaseProps {
  extremums: IExtremums
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<Props extends IProps> extends UIComponent<
  Props,
  {}
> {
  tempActionGroup = this.project._actions.historic.temp()

  _renderTempPointsInSelection = (
    getAllPoints: IGetAllPoints,
    tempPointRenderer: ITempPointRenderer,
  ) => {
    return (
      <RenderBlocker>
        <SelectionStatusContext.Consumer>
          {status => {
            if (status === 'committingChanges') {
              this.props.extremumsAPI.unpersist()
              const pointsInSelection = this.props.selectionAPI.getSelectedPointsOfItem(
                this.props.propGetter('itemKey'),
              )
              if (
                pointsInSelection != null &&
                Object.keys(pointsInSelection).length > 0
              ) {
                const allPoints = getAllPoints()
                const expanded = this.props.propGetter('itemExpanded')
                const tempPointsInSelection = this._getTempPointsInSelection(
                  pointsInSelection,
                  allPoints,
                )

                const nextExtremums = calculateNextExtremums(allPoints)

                const normalizedTempPointsInSelection = this._getNormalizedTempPointsInSelection(
                  tempPointsInSelection,
                  nextExtremums,
                )

                Object.keys(pointsInSelection)
                  .map(Number)
                  .forEach(pointIndex => {
                    this._addPointToSelection(
                      pointIndex,
                      {
                        time: normalizedTempPointsInSelection[pointIndex].time,
                        value: expanded
                          ? normalizedTempPointsInSelection[pointIndex].value
                          : 50,
                      },
                      nextExtremums,
                    )
                  })
              }
              return null
            }

            if (status === 'movingPoints') {
              const pointsInSelection = this.props.selectionAPI.getSelectedPointsOfItem(
                this.props.propGetter('itemKey'),
              )
              if (
                pointsInSelection != null &&
                Object.keys(pointsInSelection).length > 0
              ) {
                this.props.extremumsAPI.persist()

                const tempPointsInSelection = this._getTempPointsInSelection(
                  pointsInSelection,
                  getAllPoints(),
                )

                return Object.keys(tempPointsInSelection)
                  .sort()
                  .map(Number)
                  .map(index => {
                    const point = tempPointsInSelection[index]
                    const nextPoint = tempPointsInSelection[index + 1]
                    return (
                      <g key={index}>{tempPointRenderer(point, nextPoint)}</g>
                    )
                  })
              }
            }
            this.props.extremumsAPI.unpersist()
            return null
          }}
        </SelectionStatusContext.Consumer>
      </RenderBlocker>
    )
  }

  _getNormalizedTempPointsInSelection(
    tempPointsInSelection: ITempPointsInSelection,
    nextExtremums: IExtremums,
  ): ITempPointsInSelection {
    const normalizeTime = getTimeNormalizer(this.props.propGetter('duration'))
    const normalizeValue = getValueNormalizer(nextExtremums)
    return Object.keys(tempPointsInSelection).reduce(
      (normalizedTempPoints, pointIndex) => {
        const {
          originalTime,
          originalValue,
          interpolationDescriptor,
        } = tempPointsInSelection[pointIndex]
        return {
          ...normalizedTempPoints,
          [pointIndex]: {
            originalTime,
            originalValue,
            time: normalizeTime(originalTime),
            value: normalizeValue(originalValue),
            interpolationDescriptor: {...interpolationDescriptor},
          },
        }
      },
      {} as ITempPointsInSelection,
    )
  }

  _getTempPointsInSelection(
    pointsInSelection: ICollectionOfSelectedPointsData,
    allPoints: INormalizedPoints,
  ): ITempPointsInSelection {
    return Object.keys(pointsInSelection)
      .map(Number)
      .sort()
      .reduce(
        (tempPointsInSelection, pointIndex) => {
          const prevIndex = pointIndex - 1
          const prevPoint = allPoints[prevIndex]
          if (
            prevPoint != null &&
            prevPoint.interpolationDescriptor.connected
          ) {
            if (tempPointsInSelection[prevIndex] == null) {
              tempPointsInSelection[prevIndex] = {...prevPoint}
            }
          }
          const point = allPoints[pointIndex]
          if (tempPointsInSelection[pointIndex] == null) {
            tempPointsInSelection[pointIndex] = {...point}
          }
          if (point.interpolationDescriptor.connected) {
            const nextIndex = pointIndex + 1
            tempPointsInSelection[nextIndex] = {...allPoints[nextIndex]}
          }
          return tempPointsInSelection
        },
        {} as ITempPointsInSelection,
      )
  }

  _removePoint = (pointIndex: number) => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.removePointInBezierCurvesOfScalarValues({
        propAddress: this.props.propGetter('itemAddress'),
        pointIndex,
      }),
    )
  }

  _addConnector = (pointIndex: number) => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.addConnectorInBezierCurvesOfScalarValues({
        propAddress: this.props.propGetter('itemAddress'),
        pointIndex,
      }),
    )
  }

  _removeConnector = (pointIndex: number) => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.removeConnectorInBezierCurvesOfScalarValues(
        {
          propAddress: this.props.propGetter('itemAddress'),
          pointIndex,
        },
      ),
    )
  }

  _movePointToNewCoords: IMovePointToNewCoords = (pointIndex, newCoords) => {
    this.props.extremumsAPI.unpersist()

    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.movePointToNewCoordsInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newCoords,
          },
        ),
      ]),
    )
  }

  _movePointToNewCoordsTemp: IMovePointToNewCoordsTemp = (
    pointIndex,
    originalCoords,
    change,
    minimumHumanNoticableDiffInTime: number,
    minimumHumanNoticableDiffInValue: number,
  ) => {
    this.props.extremumsAPI.persist()
    const {extremums} = this.props

    const timelineDuration = this.props.propGetter('duration')

    const humanUnreadableTime =
      originalCoords.time + (change.time * timelineDuration) / 100
    let time = humanUnreadableTime

    if (minimumHumanNoticableDiffInTime !== 0) {
      const [minChange, maxChange] = [
        change.time - minimumHumanNoticableDiffInTime,
        change.time + minimumHumanNoticableDiffInTime,
      ]
      const [minTime, maxTime] = [
        originalCoords.time + (minChange * timelineDuration) / 100,
        originalCoords.time + (maxChange * timelineDuration) / 100,
      ]
      const humanReadableTime = roundestNumberBetween(minTime, maxTime)
      // console.log('t', time, humanReadableTime)

      time = humanReadableTime
    }

    const humanUnreadableValue =
      originalCoords.value -
      (change.value * (extremums[1] - extremums[0])) / 100
    let value = humanUnreadableValue

    if (minimumHumanNoticableDiffInValue !== 0) {
      const [minChange, maxChange] = [
        change.value - minimumHumanNoticableDiffInValue,
        change.value + minimumHumanNoticableDiffInValue,
      ]
      // console.log({minChange, maxChange});

      const [maxValue, minValue] = [
        originalCoords.value -
          (minChange * (extremums[1] - extremums[0])) / 100,
        originalCoords.value -
          (maxChange * (extremums[1] - extremums[0])) / 100,
      ]

      const humanReadableValue = roundestNumberBetween(minValue, maxValue)
      // console.log(humanUnreadableValue, minValue, maxValue, humanReadableValue)

      value = humanReadableValue
    }

    const newCoords = {
      time,
      value,
    }

    this.project.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.project._actions.historic.movePointToNewCoordsInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newCoords,
            snapToFrameSize: FRAME_DURATION,
          },
        ),
      ),
    )
    return {
      time: humanUnreadableTime,
      value: humanUnreadableValue,
    }
  }

  _addPointToSelection: IAddPointToSelection = (
    pointIndex,
    pointData,
    extremums = this.props.extremums,
  ) => {
    return this.props.selectionAPI.addPoint(
      this.props.propGetter('itemKey'),
      pointIndex,
      extremums,
      pointData,
    )
  }

  _removePointFromSelection: IRemovePointFromSelection = pointIndex => {
    return this.props.selectionAPI.removePoint(
      this.props.propGetter('itemKey'),
      pointIndex,
    )
  }

  _showPointValuesEditor: IShowPointValuesEditor = props => {
    this.props.overlaysAPI.showPointValuesEditor({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }

  _showPointContextMenu: IShowPointContextMenu = props => {
    this.props.overlaysAPI.showPointContextMenu({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }

  _showConnectorContextMenu: IShowConnectorContextMenu = props => {
    this.props.overlaysAPI.showConnectorContextMenu({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }
}
