import React from 'react'

import withUtils, {
  IWithUtilsProps,
} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import ViewBase, {
  IViewBaseProps,
} from '$tl/ui/panels/AllInOnePanel/Right/views/ViewBase'
import DopesheetPoint from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/DopesheetPoint'
import {
  TColor,
  TNormalizedPoints,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TMoveDopesheetConnector,
  TMoveDopesheetConnectorTemp,
  TGetAllPoints,
  TTempPointRenderer,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import TempPointInSelection from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/TempPointInSelection'

interface IProps extends IViewBaseProps {
  color: TColor
  points: TNormalizedPoints
}

class Dopesheet extends ViewBase<IProps & IWithUtilsProps> {
  render() {
    const {color, points, propGetter} = this.props
    return (
      <>
        {this._renderTempPointsInSelection(
          this._getAllPoints,
          this._tempPointRenderer,
        )}
        <g fill={color.normal} stroke={color.normal}>
          {points.map((point, index) => {
            const prevPoint = points[index - 1]
            const nextPoint = points[index + 1]
            const nextNextPoint = points[index + 2]
            return (
              <DopesheetPoint
                key={index}
                color={color}
                pointIndex={index}
                originalTime={point.originalTime}
                originalValue={point.originalValue}
                pointTime={point.time}
                pointConnected={point.interpolationDescriptor.connected}
                removePoint={this._removePoint}
                addConnector={this._addConnector}
                removeConnector={this._removeConnector}
                movePointToNewCoords={this._movePointToNewCoords}
                movePointToNewCoordsTemp={this._movePointToNewCoordsTemp}
                moveConnector={this.moveConnector}
                moveConnectorTemp={this.moveConnectorTemp}
                propGetter={propGetter}
                addPointToSelection={this._addPointToSelection}
                removePointFromSelection={this._removePointFromSelection}
                showPointValuesEditor={this._showPointValuesEditor}
                showPointContextMenu={this._showPointContextMenu}
                showConnectorContextMenu={this._showConnectorContextMenu}
                {...(prevPoint != null
                  ? {
                      prevPointTime: prevPoint.time,
                      prevPointConnected:
                        prevPoint.interpolationDescriptor.connected,
                    }
                  : {})}
                {...(nextPoint != null
                  ? {
                      nextPointTime: nextPoint.time,
                      nextPointConnected:
                        nextPoint.interpolationDescriptor.connected,
                    }
                  : {})}
                {...(nextNextPoint != null
                  ? {
                      nextNextPointTime: nextNextPoint.time,
                    }
                  : {})}
              />
            )
          })}
        </g>
      </>
    )
  }

  _getAllPoints: TGetAllPoints = () => {
    return this.props.points
  }

  _tempPointRenderer: TTempPointRenderer = (point, nextPoint) => {
    return (
      <TempPointInSelection
        color={this.props.color}
        point={point}
        nextPoint={nextPoint}
      />
    )
  }

  moveConnector: TMoveDopesheetConnector = pointIndex => {
    this.props.extremumsAPI.unpersist()
    const {propGetter, points} = this.props
    const point = points[pointIndex]
    const nextPoint = points[pointIndex + 1]

    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.moveDopesheetConnectorInBezierCurvesOfScalarValues(
          {
            propAddress: propGetter('itemAddress'),
            leftPoint: {
              index: pointIndex,
              newTime: point.originalTime,
            },
            rightPoint: {
              index: pointIndex + 1,
              newTime: nextPoint.originalTime,
            },
          },
        ),
      ]),
    )
  }

  moveConnectorTemp: TMoveDopesheetConnectorTemp = (pointIndex, moveAmount) => {
    this.props.extremumsAPI.persist()
    const {propGetter, points} = this.props
    const timeChange = (moveAmount * propGetter('duration')) / 100

    const point = points[pointIndex]
    const nextPoint = points[pointIndex + 1]

    this.project.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.project._actions.historic.moveDopesheetConnectorInBezierCurvesOfScalarValues(
          {
            propAddress: propGetter('itemAddress'),
            leftPoint: {
              index: pointIndex,
              newTime: point.originalTime + timeChange,
            },
            rightPoint: {
              index: pointIndex + 1,
              newTime: nextPoint.originalTime + timeChange,
            },
          },
        ),
      ),
    )
  }
}

export default withUtils(Dopesheet)
