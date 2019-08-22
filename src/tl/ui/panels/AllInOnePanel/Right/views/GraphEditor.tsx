import React from 'react'
import withUtils, {
  IWithUtilsProps,
} from '$tl/ui/panels/AllInOnePanel/Right/views/withUtils'
import ViewBase, {
  IViewBaseProps,
} from '$tl/ui/panels/AllInOnePanel/Right/views/ViewBase'
import GraphEditorPoint from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/GraphEditorPoint'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import {
  IColor,
  INormalizedPoints,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  IMoveSingleHandle,
  IFnNeedsPointIndex,
  IGetAllPoints,
  ITempPointRenderer,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import TempPointInSelection from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/TempPointInSelection'

interface IProps extends IViewBaseProps {
  color: IColor
  points: INormalizedPoints
}

class GraphEditor extends ViewBase<IProps & IWithUtilsProps> {
  render() {
    const {points, color, propGetter} = this.props
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
                  key={index}
                  color={color}
                  point={point}
                  {...(prevPoint ? {prevPoint} : {})}
                  {...(nextPoint ? {nextPoint} : {})}
                  pointIndex={index}
                  propGetter={propGetter}
                  removePoint={this._removePoint}
                  addConnector={this._addConnector}
                  movePointToNewCoords={this._movePointToNewCoords}
                  movePointToNewCoordsTemp={this._movePointToNewCoordsTemp}
                  moveLeftHandle={this.moveLeftHandle}
                  moveLeftHandleTemp={this.moveLeftHandleTemp}
                  moveRightHandle={this.moveRightHandle}
                  moveRightHandleTemp={this.moveRightHandleTemp}
                  makeRightHandleHorizontal={this.makeRightHandleHorizontal}
                  makeLeftHandleHorizontal={this.makeLeftHandleHorizontal}
                  showPointValuesEditor={this._showPointValuesEditor}
                  showContextMenu={this._showPointContextMenu}
                  addPointToSelection={this._addPointToSelection}
                  removePointFromSelection={this._removePointFromSelection}
                />
              </g>
            )
          })}
        </g>
      </>
    )
  }

  _getAllPoints: IGetAllPoints = () => {
    return this.props.points
  }

  _tempPointRenderer: ITempPointRenderer = (point, nextPoint) => {
    return (
      <TempPointInSelection
        color={this.props.color}
        point={point}
        nextPoint={nextPoint}
      />
    )
  }

  moveLeftHandle: IMoveSingleHandle = (pointIndex, newHandle) => {
    this.props.extremumsAPI.unpersist()
    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.movePointLeftHandleInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newHandle,
          },
        ),
      ]),
    )
  }

  moveLeftHandleTemp: IMoveSingleHandle = (pointIndex, newHandle) => {
    this.props.extremumsAPI.persist()
    this.project.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.project._actions.historic.movePointLeftHandleInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newHandle,
          },
        ),
      ),
    )
  }

  moveRightHandle: IMoveSingleHandle = (pointIndex, newHandle) => {
    this.props.extremumsAPI.unpersist()
    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.movePointRightHandleInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newHandle,
          },
        ),
      ]),
    )
  }

  moveRightHandleTemp: IMoveSingleHandle = (pointIndex, newHandle) => {
    this.props.extremumsAPI.persist()
    this.project.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.project._actions.historic.movePointRightHandleInBezierCurvesOfScalarValues(
          {
            propAddress: this.props.propGetter('itemAddress'),
            pointIndex,
            newHandle,
          },
        ),
      ),
    )
  }

  makeLeftHandleHorizontal: IFnNeedsPointIndex = pointIndex => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.makePointLeftHandleHorizontalInBezierCurvesOfScalarValues(
        {
          propAddress: this.props.propGetter('itemAddress'),
          pointIndex,
        },
      ),
    )
  }

  makeRightHandleHorizontal: IFnNeedsPointIndex = pointIndex => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.makePointRightHandleHorizontalInBezierCurvesOfScalarValues(
        {
          propAddress: this.props.propGetter('itemAddress'),
          pointIndex,
        },
      ),
    )
  }
}

export default withUtils(GraphEditor)
