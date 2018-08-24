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
              movePoint={this.movePoint}
              moveConnector={this.moveConnector}
              propGetter={propGetter}
              getValueRelativeToBoxHeight={this.getValueRelativeToBoxHeight}
              addPointToSelection={this._addPointToSelection}
              removePointFromSelection={this._removePointFromSelection}
              showPointValuesEditor={this._showPointValuesEditor}
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

  movePoint = (pointIndex: number, move: number) => {
    console.log('movePoint', {pointIndex, move})
    // this._changePointPositionBy(pointIndex, {time: move, value: 0})
  }

  moveConnector = (pointIndex: number, move: number) => {
    console.log('moveConnector', {pointIndex, move})
    // const {pathToTimeline, variableId, propGetter} = this.props
    // this.dispatch(
    //   reduceHistoricState(
    //     [...pathToTimeline, 'variables', variableId, 'points'],
    //     (points: IBezierCurvesOfScalarValues['points']): TPoint[] => {
    //       return immer(points, p => {
    //         const change = (move * propGetter('duration')) / 100
    //         p[pointIndex].time += change
    //         if (p[pointIndex + 1] != null) {
    //           p[pointIndex + 1].time += change
    //         }
    //         return p
    //       })
    //     },
    //   ),
    // )
  }
}

export default withUtils(Dopesheet)
