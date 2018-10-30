import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import {
  TPoint,
  VariableID,
  PointPosition,
} from '$studio/AnimationTimelinePanel/types'
import {IWithUtilsProps} from '$studio/AnimationTimelinePanel/views/withUtils'
import {
  TShowConnectorContextMenu,
  TShowPointContextMenu,
  TShowPointValuesEditor,
  TRemovePointFromSelection,
  TAddPointToSelection,
} from '$studio/AnimationTimelinePanel/views/types'

export interface IViewBaseProps {
  pathToTimeline: string[]
  variableId: VariableID
  extremums: [number, number]
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<
  Props extends IProps
> extends PureComponentWithTheater<Props, {}> {
  _removePoint = (pointIndex: number) => {
    const {pathToTimeline, variableId} = this.props
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'variables', variableId, 'points'],
        (points: TPoint[]): TPoint[] => {
          if (
            points[pointIndex - 1] != null &&
            points[pointIndex + 1] == null
          ) {
            points[pointIndex - 1].interpolationDescriptor.connected = false
          }
          return points
            .slice(0, pointIndex)
            .concat(points.slice(pointIndex + 1))
        },
      ),
    )
  }

  _addConnector = (pointIndex: number) => {
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

  _removeConnector = (pointIndex: number) => {
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

  _changePointPositionBy = (pointIndex: number, change: PointPosition) => {
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

  _addPointToSelection: TAddPointToSelection = (pointIndex, pointData) => {
    this.props.selectionAPI.addPoint(
      this.props.propGetter('boxIndex'),
      this.props.variableId,
      this.props.extremums,
      pointIndex,
      pointData,
    )
  }

  _removePointFromSelection: TRemovePointFromSelection = pointIndex => {
    this.props.selectionAPI.removePoint(
      this.props.propGetter('boxIndex'),
      this.props.variableId,
      pointIndex,
    )
  }

  _showPointValuesEditor: TShowPointValuesEditor = props => {
    this.props.overlaysAPI.showPointValuesEditor({
      ...props,
      variableId: this.props.variableId,
    })
  }

  _showPointContextMenu: TShowPointContextMenu = props => {
    this.props.overlaysAPI.showPointContextMenu({
      ...props,
      variableId: this.props.variableId,
    })
  }

  _showConnectorContextMenu: TShowConnectorContextMenu = props => {
    this.props.overlaysAPI.showConnectorContextMenu({
      ...props,
      variableId: this.props.variableId,
    })
  }
}
