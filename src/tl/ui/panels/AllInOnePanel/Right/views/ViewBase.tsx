import React from 'react'
import {IWithUtilsProps} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TExtremums} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  TShowPointContextMenu,
  TShowPointValuesEditor,
  TMovePointToNewCoords,
  TShowConnectorContextMenu,
  TAddPointToSelection,
  TRemovePointFromSelection,
  TMovePointToNewCoordsTemp,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {SelectedAreaContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import RenderBlocker from '$shared/components/RenderBlocker/RenderBlocker'

export interface IViewBaseProps {
  extremums: TExtremums
}

interface IProps extends IViewBaseProps, IWithUtilsProps {}

export default class ViewBase<Props extends IProps> extends UIComponent<
  Props,
  {}
> {
  tempActionGroup = this.project._actions.historic.temp()

  _renderSelectedAreaConsumer = () => {
    return (
      <RenderBlocker>
        <SelectedAreaContext.Consumer>
          {selectedArea => {
            const itemKey = this.props.propGetter('itemKey')
            if (selectedArea[itemKey] != null) {
              this.props.extremumsAPI.persist()
            } else {
              this.props.extremumsAPI.unpersist()
            }
            return null
          }}
        </SelectedAreaContext.Consumer>
      </RenderBlocker>
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
