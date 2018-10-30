import React from 'react'
import {
  TColor,
  TNormalizedPoint,
  PointHandles,
} from '$studio/AnimationTimelinePanel/types'
import withUtils, {
  IWithUtilsProps,
} from '$studio/AnimationTimelinePanel/views/withUtils'
import ViewBase, {
  IViewBaseProps,
} from '$studio/AnimationTimelinePanel/views/ViewBase'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import GraphEditorPoint from '$studio/AnimationTimelinePanel/views/graphEditor/GraphEditorPoint'
import BezierConnector from '$studio/AnimationTimelinePanel/views/graphEditor/BezierConnector'

interface IProps extends IViewBaseProps {
  color: TColor
  points: TNormalizedPoint[]
}

class GraphEditor extends ViewBase<IProps & IWithUtilsProps> {
  render() {
    const {points, color, propGetter} = this.props
    return (
      <g key="variable" fill={color.normal} stroke={color.normal}>
        {points.map((point: TNormalizedPoint, index: number) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          return (
            <g key={index}>
              {point.interpolationDescriptor.connected &&
                nextPoint != null && (
                  <BezierConnector
                    leftPointIndex={index}
                    leftPointTime={point.time}
                    leftPointValue={point.value}
                    rightPointTime={nextPoint.time}
                    rightPointValue={nextPoint.value}
                    handles={point.interpolationDescriptor.handles}
                    removeConnector={this._removeConnector}
                    showContextMenu={this._showConnectorContextMenu}
                  />
                )}
              <GraphEditorPoint
                key={`${point._value}${point._t}`}
                color={color}
                propGetter={propGetter}
                pointTime={point.time}
                pointValue={point.value}
                pointHandles={point.interpolationDescriptor.handles}
                pointConnected={point.interpolationDescriptor.connected}
                pointAbsoluteTime={point._t}
                pointAbsoluteValue={point._value}
                pointIndex={index}
                removePoint={this._removePoint}
                addConnector={this._addConnector}
                changePointPositionBy={this._changePointPositionBy}
                changePointHandlesBy={this.changePointHandlesBy}
                makeHandleHorizontal={this.makeHandleHorizontal}
                showPointValuesEditor={this._showPointValuesEditor}
                showContextMenu={this._showPointContextMenu}
                addPointToSelection={this._addPointToSelection}
                removePointFromSelection={this._removePointFromSelection}
                {...(prevPoint
                  ? {
                      prevPointTime: prevPoint.time,
                      prevPointValue: prevPoint.value,
                      prevPointHandles:
                        prevPoint.interpolationDescriptor.handles,
                      prevPointConnected:
                        prevPoint.interpolationDescriptor.connected,
                    }
                  : {})}
                {...(nextPoint
                  ? {
                      nextPointTime: nextPoint.time,
                      nextPointValue: nextPoint.value,
                    }
                  : {})}
              />
            </g>
          )
        })}
      </g>
    )
  }

  changePointHandlesBy = (pointIndex: number, change: PointHandles) => {
    const {pathToTimeline, variableId} = this.props
    this.dispatch(
      reduceHistoricState(
        [
          ...pathToTimeline,
          'variables',
          variableId,
          'points',
          pointIndex,
          'interpolationDescriptor',
          'handles',
        ],
        (handles: PointHandles) => {
          return handles
            .slice(0, 2)
            .map((handle, index) => handle + change[index + 2])
            .concat(handles.slice(2))
        },
      ),
    )
    if (pointIndex > 0) {
      this.dispatch(
        reduceHistoricState(
          [
            ...pathToTimeline,
            'variables',
            variableId,
            'points',
            pointIndex - 1,
            'interpolationDescriptor',
            'handles',
          ],
          (handles: PointHandles) => {
            return handles
              .slice(0, 2)
              .concat(
                handles.slice(2).map((handle, index) => handle + change[index]),
              )
          },
        ),
      )
    }
  }

  makeHandleHorizontal = (pointIndex: number, side: 'left' | 'right') => {
    const {pathToTimeline, variableId} = this.props
    this.dispatch(
      reduceHistoricState(
        [
          ...pathToTimeline,
          'variables',
          variableId,
          'points',
          side === 'left' ? pointIndex - 1 : pointIndex,
          'interpolationDescriptor',
          'handles',
          side === 'left' ? 3 : 1,
        ],
        () => 0,
      ),
    )
  }
}

export default withUtils(GraphEditor)
