import React from 'react'
import {IWithUtilsProps} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import UIComponent from '$tl/ui/handy/UIComponent'
import {
  TExtremums,
  TNormalizedPoints,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TShowPointContextMenu,
  TShowPointValuesEditor,
  TMovePointToNewCoords,
  TShowConnectorContextMenu,
  TAddPointToSelection,
  TRemovePointFromSelection,
  TMovePointToNewCoordsTemp,
  TGetAllPoints,
  TTempPointRenderer,
  TTempPointsInSelection,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {SelectionStatusContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import RenderBlocker from '$shared/components/RenderBlocker/RenderBlocker'
import {TCollectionOfSelectedPointsData} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {
  getTimeNormalizer,
  getValueNormalizer,
  calculateNextExtremums,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'
import {roundestNumberBetween} from '$shared/utils/numberRoundingUtils'

export interface IViewBaseProps {
  extremums: TExtremums
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<Props extends IProps> extends UIComponent<
  Props,
  {}
> {
  tempActionGroup = this.project._actions.historic.temp()

  _renderTempPointsInSelection = (
    getAllPoints: TGetAllPoints,
    tempPointRenderer: TTempPointRenderer,
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
    tempPointsInSelection: TTempPointsInSelection,
    nextExtremums: TExtremums,
  ): TTempPointsInSelection {
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
      {} as TTempPointsInSelection,
    )
  }

  _getTempPointsInSelection(
    pointsInSelection: TCollectionOfSelectedPointsData,
    allPoints: TNormalizedPoints,
  ): TTempPointsInSelection {
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
        {} as TTempPointsInSelection,
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

  _movePointToNewCoords: TMovePointToNewCoords = (pointIndex, newCoords) => {
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

  _movePointToNewCoordsTemp: TMovePointToNewCoordsTemp = (
    pointIndex,
    originalCoords,
    change,
    minimumHumanNoticableDiffInTime: number,
    minimumHumanNoticableDiffInValue: number,
  ) => {
    const {extremums, propGetter, extremumsAPI} = this.props
    extremumsAPI.persist()

    const humanUnreadableTime =
      originalCoords.time + (change.time * propGetter('duration')) / 100
    let time = humanUnreadableTime

    if (minimumHumanNoticableDiffInTime !== 0) {
      const [minChange, maxChange] = [
        change.time - minimumHumanNoticableDiffInTime,
        change.time + minimumHumanNoticableDiffInTime,
      ]
      const [minTime, maxTime] = [
        originalCoords.time + (minChange * propGetter('duration')) / 100,
        originalCoords.time + (maxChange * propGetter('duration')) / 100,
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
            propAddress: propGetter('itemAddress'),
            pointIndex,
            newCoords,
          },
        ),
      ),
    )
    return {
      time: humanUnreadableTime,
      value: humanUnreadableValue,
    }
  }

  _addPointToSelection: TAddPointToSelection = (
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

  _removePointFromSelection: TRemovePointFromSelection = pointIndex => {
    return this.props.selectionAPI.removePoint(
      this.props.propGetter('itemKey'),
      pointIndex,
    )
  }

  _showPointValuesEditor: TShowPointValuesEditor = props => {
    this.props.overlaysAPI.showPointValuesEditor({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }

  _showPointContextMenu: TShowPointContextMenu = props => {
    this.props.overlaysAPI.showPointContextMenu({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }

  _showConnectorContextMenu: TShowConnectorContextMenu = props => {
    this.props.overlaysAPI.showConnectorContextMenu({
      propAddress: this.props.propGetter('itemAddress'),
      ...props,
    })
  }
}
