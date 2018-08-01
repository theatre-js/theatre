import React from 'react'
import Connector from '$theater/AnimationTimelinePanel/GraphView/Connector'
import Point from '$theater/AnimationTimelinePanel/GraphView/Point'
import {
  TColor,
  TNormalizedPoint,
  VariableID,
  TPoint,
  PointPosition,
  PointHandles,
} from '$theater/AnimationTimelinePanel/types'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {
  TPropName,
  VariablesPropGetterChannel,
} from '$theater/AnimationTimelinePanel/VariablesContainer/VariablesPropProvider'
import {Subscriber} from 'react-broadcast'
import {SelectionAPIChannel} from '$theater/AnimationTimelinePanel/SelectionProvider/SelectionProvider'
import {TSelectionAPI} from '$theater/AnimationTimelinePanel/SelectionProvider/types'
import {OverlaysAPIChannel} from '$theater/AnimationTimelinePanel/OverlaysProvider/OverlaysProvider'
import {TOverlaysAPI} from '$theater/AnimationTimelinePanel/OverlaysProvider/types'
import {
  TShowPointValuesEditor,
  TShowPointContextMenu,
  TShowConnectorContextMenu,
  TRemovePointFromSelection,
  TAddPointToSelection,
} from '$theater/AnimationTimelinePanel/GraphView/types'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

interface IOwnProps {
  color: TColor
  extremums: [number, number]
  points: TNormalizedPoint[]
  pathToTimeline: string[]
  variableId: VariableID
}

interface IProps extends IOwnProps {
  propGetter: (propName: TPropName) => any
  selectionAPI: TSelectionAPI
  overlaysAPI: TOverlaysAPI
}

interface IState {}

class GraphView extends PureComponentWithTheater<IProps, IState> {
  removePoint = (pointIndex: number) => {
    const {pathToTimeline, variableId} = this.props
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'variables', variableId, 'points'],
        (points: TPoint[]): TPoint[] => {
          if (points[pointIndex - 1] != null) {
            points[pointIndex - 1].interpolationDescriptor.connected = false
          }
          return points
            .slice(0, pointIndex)
            .concat(points.slice(pointIndex + 1))
        },
      ),
    )
  }

  addConnector = (pointIndex: number) => {
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
          'connected',
        ],
        () => true,
      ),
    )
  }

  removeConnector = (pointIndex: number) => {
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
          'connected',
        ],
        () => false,
      ),
    )
  }

  changePointPositionBy = (pointIndex: number, change: PointPosition) => {
    const {extremums, variableId, pathToTimeline, propGetter} = this.props
    const extDiff = extremums[1] - extremums[0]
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'variables', variableId, 'points', pointIndex],
        (point: TPoint) => ({
          ...point,
          time: point.time + (change.time * propGetter('duration')) / 100,
          value: point.value - (change.value * extDiff) / 100,
        }),
      ),
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

  addPointToSelection: TAddPointToSelection = (pointIndex, pointData) => {
    this.props.selectionAPI.addPoint(
      this.props.propGetter('boxIndex'),
      this.props.variableId,
      this.props.extremums,
      pointIndex,
      pointData,
    )
  }

  removePointFromSelection: TRemovePointFromSelection = pointIndex => {
    this.props.selectionAPI.removePoint(
      this.props.propGetter('boxIndex'),
      this.props.variableId,
      pointIndex,
    )
  }

  showPointValuesEditor: TShowPointValuesEditor = props => {
    this.props.overlaysAPI.showPointValuesEditor({
      ...props,
      variableId: this.props.variableId,
    })
  }

  showPointContextMenu: TShowPointContextMenu = props => {
    this.props.overlaysAPI.showPointContextMenu({
      ...props,
      variableId: this.props.variableId,
    })
  }

  showConnectorContextMenu: TShowConnectorContextMenu = props => {
    this.props.overlaysAPI.showConnectorContextMenu({
      ...props,
      variableId: this.props.variableId,
    })
  }

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
                  <Connector
                    leftPointIndex={index}
                    leftPointTime={point.time}
                    leftPointValue={point.value}
                    rightPointTime={nextPoint.time}
                    rightPointValue={nextPoint.value}
                    handles={point.interpolationDescriptor.handles}
                    removeConnector={this.removeConnector}
                    showContextMenu={this.showConnectorContextMenu}
                  />
                )}
              <Point
                key={`${point._value}${point._t}`}
                color={color}
                propGetter={propGetter}
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
                pointTime={point.time}
                pointValue={point.value}
                pointHandles={point.interpolationDescriptor.handles}
                pointConnected={point.interpolationDescriptor.connected}
                pointAbsoluteTime={point._t}
                pointAbsoluteValue={point._value}
                pointIndex={index}
                removePoint={this.removePoint}
                addConnector={this.addConnector}
                changePointPositionBy={this.changePointPositionBy}
                changePointHandlesBy={this.changePointHandlesBy}
                makeHandleHorizontal={this.makeHandleHorizontal}
                showPointValuesEditor={this.showPointValuesEditor}
                showContextMenu={this.showPointContextMenu}
                addPointToSelection={this.addPointToSelection}
                removePointFromSelection={this.removePointFromSelection}
              />
            </g>
          )
        })}
      </g>
    )
  }
}

export default (props: IOwnProps) => (
  <Subscriber channel={VariablesPropGetterChannel}>
    {(propGetter: IProps['propGetter']) => (
      <Subscriber channel={SelectionAPIChannel}>
        {(selectoinAPI: IProps['selectionAPI']) => (
          <Subscriber channel={OverlaysAPIChannel}>
            {(overlaysAPI: IProps['overlaysAPI']) => (
              <GraphView
                {...props}
                propGetter={propGetter}
                selectionAPI={selectoinAPI}
                overlaysAPI={overlaysAPI}
              />
            )}
          </Subscriber>
        )}
      </Subscriber>
    )}
  </Subscriber>
)
