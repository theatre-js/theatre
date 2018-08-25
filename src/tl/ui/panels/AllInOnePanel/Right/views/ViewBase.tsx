import {IWithUtilsProps} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TExtremums} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TShowPointContextMenu,
  TShowPointValuesEditor,
  TMovePointToNewCoords,
  TShowConnectorContextMenu,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'

export interface IViewBaseProps {
  extremums: TExtremums
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<Props extends IProps> extends UIComponent<
  Props,
  {}
> {
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

  _movePointToNewCoords: TMovePointToNewCoords = (
    pointIndex,
    originalCoords,
    change,
  ) => {
    const {extremums, propGetter} = this.props
    const newCoords = {
      time: originalCoords.time + (change.time * propGetter('duration')) / 100,
      value:
        originalCoords.value -
        (change.value * (extremums[1] - extremums[0])) / 100,
    }

    this.project.reduxStore.dispatch(
      this.project._actions.historic.movePointToNewCoordsInBezierCurvesOfScalarValues(
        {
          propAddress: propGetter('itemAddress'),
          pointIndex,
          newCoords,
        },
      ),
    )
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
