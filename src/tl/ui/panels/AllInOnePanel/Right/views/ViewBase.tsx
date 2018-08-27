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
import {SelectionMoveContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import RenderBlocker from '$shared/components/RenderBlocker/RenderBlocker'
import {TCollectionOfSelectedPointsData} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'

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
        <SelectionMoveContext.Consumer>
          {isMoving => {
            if (isMoving) {
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
        </SelectionMoveContext.Consumer>
      </RenderBlocker>
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
  ) => {
    const {extremums, propGetter, extremumsAPI} = this.props
    extremumsAPI.persist()

    const newCoords = {
      time: originalCoords.time + (change.time * propGetter('duration')) / 100,
      value:
        originalCoords.value -
        (change.value * (extremums[1] - extremums[0])) / 100,
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
    return newCoords
  }

  _addPointToSelection: TAddPointToSelection = (pointIndex, pointData) => {
    this.props.selectionAPI.addPoint(
      this.props.propGetter('itemKey'),
      pointIndex,
      this.props.extremums,
      pointData,
    )
  }

  _removePointFromSelection: TRemovePointFromSelection = pointIndex => {
    this.props.selectionAPI.removePoint(
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
