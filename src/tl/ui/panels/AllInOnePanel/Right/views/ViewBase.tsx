// import {
//   TPoint,
//   VariableID,
//   PointPosition,
// } from '$tl/ui/panels/AllInOnePanel/Right/types'
import {IWithUtilsProps} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TExtremums, TPointCoords} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TShowPointContextMenu} from '$theater/AnimationTimelinePanel/views/types'
// import {
//   TShowConnectorContextMenu,
//   TShowPointContextMenu,
//   TShowPointValuesEditor,
//   TRemovePointFromSelection,
//   TAddPointToSelection,
// } from '$tl/ui/panels/AllInOnePanel/Right/views/types'

export interface IViewBaseProps {
  // pathToTimeline: string[]
  // variableId: VariableID
  extremums: TExtremums
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<Props extends IProps> extends UIComponent<
  Props,
  {}
> {
  _removePoint = (pointIndex: number) => {
    console.log('_removPoint', {pointIndex})
    // const {pathToTimeline, variableId} = this.props
    // this.dispatch(
    //   reduceHistoricState(
    //     [...pathToTimeline, 'variables', variableId, 'points'],
    //     (points: TPoint[]): TPoint[] => {
    //       if (points[pointIndex - 1] != null && points[pointIndex + 1] == null) {
    //         points[pointIndex - 1].interpolationDescriptor.connected = false
    //       }
    //       return points
    //         .slice(0, pointIndex)
    //         .concat(points.slice(pointIndex + 1))
    //     },
    //   ),
    // )
  }

  _addConnector = (pointIndex: number) => {
    console.log('_addConnector', {pointIndex})
    // const {pathToTimeline, variableId} = this.props
    // this.dispatch(
    //   reduceHistoricState(
    //     [
    //       ...pathToTimeline,
    //       'variables',
    //       variableId,
    //       'points',
    //       pointIndex,
    //       'interpolationDescriptor',
    //       'connected',
    //     ],
    //     () => true,
    //   ),
    // )
  }

  _removeConnector = (pointIndex: number) => {
    console.log('_removeConnector', {pointIndex})
    // const {pathToTimeline, variableId} = this.props
    // this.dispatch(
    //   reduceHistoricState(
    //     [
    //       ...pathToTimeline,
    //       'variables',
    //       variableId,
    //       'points',
    //       pointIndex,
    //       'interpolationDescriptor',
    //       'connected',
    //     ],
    //     () => false,
    //   ),
    // )
  }

  _changePointCoordsBy = (pointIndex: number, change: TPointCoords) => {
    console.log('_changePointCoordsBy', {pointIndex, change})
    // const {extremums, variableId, pathToTimeline, propGetter} = this.props
    // const extDiff = extremums[1] - extremums[0]
    // this.dispatch(
    //   reduceHistoricState(
    //     [...pathToTimeline, 'variables', variableId, 'points', pointIndex],
    //     (point: TPoint) => ({
    //       ...point,
    //       time: point.time + (change.time * propGetter('duration')) / 100,
    //       value: point.value - (change.value * extDiff) / 100,
    //     }),
    //   ),
    // )
  }

  // TODO: Fix Me
  // @ts-ignore
  _addPointToSelection /*: TAddPointToSelection*/ = (pointIndex, pointData) => {
    console.log('_addPointToSelection', {pointIndex, pointData})
    // this.props.selectionAPI.addPoint(
    //   this.props.propGetter('boxIndex'),
    //   this.props.variableId,
    //   this.props.extremums,
    //   pointIndex,
    //   pointData,
    // )
  }

  // TODO: Fix Me
  // @ts-ignore
  _removePointFromSelection /*: TRemovePointFromSelection*/ = pointIndex => {
    console.log('_removePointFromSelection', {pointIndex})
    // this.props.selectionAPI.removePoint(
    //   this.props.propGetter('boxIndex'),
    //   this.props.variableId,
    //   pointIndex,
    // )
  }

  // TODO: Fix Me
  // @ts-ignore
  _showPointValuesEditor /*: TShowPointValuesEditor*/ = props => {
    // console.log('_showPointValuesEditor', {props})
    this.props.overlaysAPI.showPointValuesEditor({
      ...props,
      propAddress: this.props.propGetter('itemAddress'),
    })
  }

  // TODO: Fix Me
  // @ts-ignore
  _showPointContextMenu: TShowPointContextMenu = props => {
    // this.props.overlaysAPI.showPointContextMenu({
    //   ...props,
    //   variableId: this.props.variableId,
    // })
  }

  // TODO: Fix Me
  // @ts-ignore
  _showConnectorContextMenu /*: TShowConnectorContextMenu*/ = props => {
    console.log('_showConnectorContextMenu', {props})
    // this.props.overlaysAPI.showConnectorContextMenu({
    //   ...props,
    //   variableId: this.props.variableId,
    // })
  }
}
