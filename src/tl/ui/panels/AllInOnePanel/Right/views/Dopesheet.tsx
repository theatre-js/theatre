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
import {TMoveDopesheetConnector} from '$tl/ui/panels/AllInOnePanel/Right/views/types'

interface IProps extends IViewBaseProps {
  color: TColor
  points: TNormalizedPoints
  // valueRelativeToBoxHeight: number
}

class Dopesheet extends ViewBase<IProps & IWithUtilsProps> {
  render() {
    const {color, points, propGetter} = this.props
    return (
      <g key="variable" fill={color.normal} stroke={color.normal}>
        {points.map((point, index) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          const nextNextPoint = points[index + 2]
          return (
            <DopesheetPoint
              key={index}
              pointIndex={index}
              color={color}
              originalTime={point.originalTime}
              originalValue={point.originalValue}
              pointTime={point.time}
              pointConnected={point.interpolationDescriptor.connected}
              removePoint={this._removePoint}
              addConnector={this._addConnector}
              removeConnector={this._removeConnector}
              movePointToNewCoords={this._movePointToNewCoords}
              moveConnector={this.moveConnector}
              propGetter={propGetter}
              getValueRelativeToBoxHeight={this.getValueRelativeToBoxHeight}
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
    )
  }

  getValueRelativeToBoxHeight = () => {
    console.log('getValueRelativeToBoxHeight')
    return 0
    // return this.props.valueRelativeToBoxHeight
  }

  moveConnector: TMoveDopesheetConnector = (pointIndex, moveAmount) => {
    const {propGetter, points} = this.props
    const timeChange = (moveAmount * propGetter('duration')) / 100

    const point = points[pointIndex]
    const nextPoint = points[pointIndex + 1]

    this.project.reduxStore.dispatch(
      this.project._actions.historic.moveDopesheetConnectorInBezierCurvesOfScalarValues(
        {
          propAddress: propGetter('itemAddress'),
          leftPoint: {
            index: pointIndex,
            newTime: point.originalTime + timeChange,
          },
          ...(nextPoint != null
            ? {
                rightPoint: {
                  index: pointIndex + 1,
                  newTime: nextPoint.originalTime + timeChange,
                },
              }
            : {}),
        },
      ),
    )
  }
}

export default withUtils(Dopesheet)
