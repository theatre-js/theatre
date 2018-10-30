import React from 'react'
import {
  TColor,
  TNormalizedPoint,
  TPoint,
} from '$studio/AnimationTimelinePanel/types'
// import Point from '$studio/AnimationTimelinePanel/DopeSheetView/Point'
import withUtils, {
  IWithUtilsProps,
} from '$studio/AnimationTimelinePanel/views/withUtils'
import ViewBase, {
  IViewBaseProps,
} from '$studio/AnimationTimelinePanel/views/ViewBase'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import immer from 'immer'
import DopeSheetPoint from '$studio/AnimationTimelinePanel/views/dopeSheet/DopeSheetPoint'

interface IProps extends IViewBaseProps {
  color: TColor
  points: TNormalizedPoint[]
  valueRelativeToBoxHeight: number
}

class DopeSheet extends ViewBase<IProps & IWithUtilsProps> {
  render() {
    const {color, points, propGetter} = this.props
    return (
      <g key="variable" fill={color.normal} stroke={color.normal}>
        {points.map((point: TNormalizedPoint, index: number) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          const nextNextPoint = points[index + 2]
          return (
            <DopeSheetPoint
              key={index}
              pointIndex={index}
              color={color}
              pointAbsoluteTime={point._t}
              pointAbsoluteValue={point._value}
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
    return this.props.valueRelativeToBoxHeight
  }

  movePoint = (pointIndex: number, move: number) => {
    this._changePointPositionBy(pointIndex, {time: move, value: 0})
  }

  moveConnector = (pointIndex: number, move: number) => {
    const {pathToTimeline, variableId, propGetter} = this.props
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'variables', variableId, 'points'],
        (points: TPoint[]): TPoint[] => {
          return immer(points, p => {
            const change = (move * propGetter('duration')) / 100
            p[pointIndex].time += change
            if (p[pointIndex + 1] != null) {
              p[pointIndex + 1].time += change
            }
            return p
          })
        },
      ),
    )
  }
}

export default withUtils(DopeSheet)
