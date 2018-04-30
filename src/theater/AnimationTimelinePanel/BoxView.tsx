import {
  VariableID,
  VariableObject,
  Point,
  PointPosition,
  PointHandles,
} from '$theater/animationTimelinePanel/types'
import * as css from './BoxView.css'
import Variables from './Variables'
import PointValuesEditor from './PointValuesEditor'
import * as _ from 'lodash'
import cx from 'classnames'
import {MODE_CMD} from '$theater/workspace/components/StudioUI/StudioUI'
import HalfPieContextMenu from '$theater/common/components/HalfPieContextMenu'
import MdCancel from 'react-icons/lib/md/cancel'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdStars from 'react-icons/lib/md/stars'
import MdCamera from 'react-icons/lib/md/camera'
import {
  reduceStateAction,
  multiReduceStateAction,
} from '$shared/utils/redux/commonActions'
import React from 'react'
import connect from '$theater/handy/connect';
import StudioComponent from '$theater/handy/StudioComponent';

interface IOwnProps {
  variables: VariableObject[]
  variableIds: VariableID[]
  activeVariableId: VariableID
  svgHeight: number
  svgWidth: number
  duration: number
  activeMode: string
  pathToVariables: string[]
  scrollLeft: number
  addPointToSelection: Function
  removePointFromSelection: Function
}

interface IProps extends IOwnProps {
  dispatch: Function
}

type IState = {
  pointValuesEditorProps: undefined | null | Object
  variableIdToColorIndexMap: {[variableId: string]: number}
}

export const svgPaddingY = 20
export const colors = [
  {name: 'blue', normal: '#3AAFA9', darkened: '#345b59'},
  {name: 'purple', normal: '#575790', darkened: '#323253'},
  {name: 'red', normal: '#B76C6C', darkened: '#4c3434'},
  {name: 'yellow', normal: '#FCE181', darkened: '#726a4b'},
]

class BoxView extends StudioComponent<IProps, IState> {
  svgArea: HTMLElement

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      pointValuesEditorProps: null,
      variableIdToColorIndexMap: this._getVariableIdToColorIndexMap(
        props.variables,
      ),
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.variableIds !== this.props.variableIds) {
      this.setState(() => ({
        variableIdToColorIndexMap: this._getVariableIdToColorIndexMap(
          nextProps.variables,
        ),
      }))
    }
  }

  _getVariableIdToColorIndexMap(
    variables: VariableObject[],
  ): {[variableId: string]: number} {
    const colorsLength = colors.length
    return variables.reduce((reducer, variable, index) => {
      return {
        ...reducer,
        [variable.id]: index % colorsLength,
      }
    }, {})
  }

  addPoint = (variableId: string, extremums: $FixMe, event: $FixMe) => {
    const {
      svgHeight,
      svgWidth,
      duration,
      activeMode,
      dispatch,
      pathToVariables,
    } = this.props
    if (activeMode !== MODE_CMD) return

    event.stopPropagation()
    event.preventDefault()
    const {clientX, clientY} = event
    const {top, left} = this.svgArea.getBoundingClientRect()
    const time = clientX - left + 5
    const value = clientY - top + 5 - 0.5 * svgPaddingY
    const pointProps: Point = {
      time: time * duration / svgWidth,
      value: extremums[1] - (value * (extremums[1] - extremums[0]) / (svgHeight - svgPaddingY)),
      interpolationDescriptor: {
        connected: false,
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        interpolationType: 'CubicBezier',
        handles: [0.5, 0, 0.5, 0],
      },
    }
    dispatch(
      reduceStateAction([...pathToVariables, variableId], variable => {
        const points = variable.points
        let atIndex = points.findIndex(point => point.time > pointProps.time)
        if (atIndex === -1) atIndex = points.length
        return {
          ...variable,
          points: points
            .slice(0, atIndex)
            .concat(pointProps, points.slice(atIndex)),
        }
      }),
    )
  }

  pathToPoints = (variableId: string) => [
    ...this.props.pathToVariables,
    variableId,
    'points',
  ]
  pathToPoint = (variableId: string, pointIndex: number) => [
    ...this.pathToPoints(variableId),
    pointIndex,
  ]

  removePoint = (variableId: VariableID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(this.pathToPoints(variableId), points => {
        if (points[pointIndex - 1] != null) {
          points[pointIndex - 1].interpolationDescriptor.connected = false
        }
        return points.slice(0, pointIndex).concat(points.slice(pointIndex + 1))
      }),
    )
  }

  setPointPositionTo = (
    variableId: VariableID,
    pointIndex: number,
    newPosition: PointPosition,
  ) => {
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        ...newPosition,
      })),
    )
  }

  changePointPositionBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointPosition,
    extremums: $FixMe,
  ) => {
    const extDiff = extremums[1] - extremums[0]
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        time: point.time + change.time * this.props.duration / 100,
        value: point.value - change.value * extDiff / 100,
      })),
    )
  }

  changePointHandlesBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointHandles,
  ) => {
    if (pointIndex === 0) {
      this.props.dispatch(
        reduceStateAction(
          [
            ...this.pathToPoint(variableId, pointIndex),
            'interpolationDescriptor',
            'handles',
          ],
          handles => {
            return handles
              .slice(0, 2)
              .map((handle, index) => handle + change[index + 2])
              .concat(handles.slice(2))
          },
        ),
      )
    } else {
      this.props.dispatch(
        multiReduceStateAction([
          {
            path: [
              ...this.pathToPoint(variableId, pointIndex),
              'interpolationDescriptor',
              'handles',
            ],
            reducer: handles => {
              return handles
                .slice(0, 2)
                .map((handle, index) => handle + change[index + 2])
                .concat(handles.slice(2))
            },
          },
          {
            path: [
              ...this.pathToPoint(variableId, pointIndex - 1),
              'interpolationDescriptor',
              'handles',
            ],
            reducer: handles => {
              return handles
                .slice(0, 2)
                .concat(
                  handles
                    .slice(2)
                    .map((handle, index) => handle + change[index]),
                )
            },
          },
        ]),
      )
    }
  }

  addConnector = (variableId: VariableID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        interpolationDescriptor: {
          ...point.interpolationDescriptor,
          connected: true,
        },
      })),
    )
  }

  removeConnector = (variableId: VariableID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        interpolationDescriptor: {
          ...point.interpolationDescriptor,
          connected: false,
        },
      })),
    )
  }

  makeHandleHorizontal = (
    variableId: VariableID,
    pointIndex: number,
    side: 'left' | 'right',
  ) => {
    if (side === 'left' && pointIndex !== 0) {
      this.props.dispatch(
        reduceStateAction(
          [
            ...this.pathToPoint(variableId, pointIndex - 1),
            'interpolationDescriptor',
            'handles',
          ],
          handles => {
            handles[3] = 0
            return handles
          },
        ),
      )
    }
    if (side === 'right') {
      this.props.dispatch(
        reduceStateAction(
          [
            ...this.pathToPoint(variableId, pointIndex),
            'interpolationDescriptor',
            'handles',
          ],
          handles => {
            handles[1] = 0
            return handles
          },
        ),
      )
    }
  }

  showPointValuesEditor = (
    variableId: VariableID,
    pointIndex: number,
    params: $FixMe,
  ) => {
    this.setState(() => ({
      pointValuesEditorProps: {...params, variableId, pointIndex},
    }))
  }

  showContextMenuForPoint = (
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number; top: number},
  ) => {
    this.setState(() => ({
      pointContextMenuProps: {...pos, variableId, pointIndex},
    }))
  }

  showContextMenuForConnector = (
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number; top: number},
  ) => {
    this.setState(() => ({
      connectorContextMenuProps: {...pos, variableId, pointIndex},
    }))
  }

  getSvgSize = () => {
    return {
      width: this.props.svgWidth,
      height: this.props.svgHeight - svgPaddingY,
    }
  }

  getDuration = () => {
    return this.props.duration
  }

  render() {
    const {
      variables,
      svgHeight,
      svgWidth,
      activeVariableId,
      activeMode,
    } = this.props
    const {pointValuesEditorProps, variableIdToColorIndexMap} = this.state

    const activeVariableColorName =
      colors[variableIdToColorIndexMap[activeVariableId]].name
    const isAddingPoint = activeMode === MODE_CMD
    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.container, {
          [css.redAddCursor]:
            isAddingPoint && activeVariableColorName === 'red',
          [css.blueAddCursor]:
            isAddingPoint && activeVariableColorName === 'blue',
          [css.yellowAddCursor]:
            isAddingPoint && activeVariableColorName === 'yellow',
          [css.purpleAddCursor]:
            isAddingPoint && activeVariableColorName === 'purple',
        })}
        style={{width: svgWidth}}
      >
        <div
          className={css.svgArea}
          style={{transform: `translate3d(${this.props.scrollLeft}px, 0, 0)`}}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            height={svgHeight}
            width={svgWidth}
            ref={svg => {
              if (svg != null) this.svgArea = svg
            }}
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight - svgPaddingY}`}
              x={0}
              y={svgPaddingY / 2}
              width={svgWidth}
              height={svgHeight - svgPaddingY}
              style={{overflow: 'visible'}}
            >
              <defs>
                <filter id="glow">
                  <feColorMatrix
                    type="matrix"
                    values={` 3  0  0  0  0
                              0  3  0  0  0
                              0  0  3  0  0
                              0  0  0  1  0`}
                  />
                  <feGaussianBlur stdDeviation=".7" />
                </filter>
              </defs>
              <Variables
                activeVariableId={activeVariableId}
                variables={variables}
                variableIdToColorIndexMap={variableIdToColorIndexMap}
                getSvgSize={this.getSvgSize}
                getDuration={this.getDuration}
                addPoint={this.addPoint}
                showPointValuesEditor={this.showPointValuesEditor}
                showContextMenuForPoint={this.showContextMenuForPoint}
                showContextMenuForConnector={this.showContextMenuForConnector}
                changePointPositionBy={this.changePointPositionBy}
                changePointHandlesBy={this.changePointHandlesBy}
                removePoint={this.removePoint}
                addConnector={this.addConnector}
                removeConnector={this.removeConnector}
                makeHandleHorizontal={this.makeHandleHorizontal}
                addPointToSelection={this.props.addPointToSelection}
                removePointFromSelection={this.props.removePointFromSelection}
              />
            </svg>
          </svg>
        </div>
        {pointValuesEditorProps != null && (
          <PointValuesEditor
            {..._.pick(pointValuesEditorProps, [
              'left',
              'top',
              'initialValue',
              'initialTime',
            ])}
            onClose={() =>
              this.setState(() => ({pointValuesEditorProps: null}))
            }
            onSubmit={newPosition =>
              this.setPointPositionTo(
                pointValuesEditorProps.variableId,
                pointValuesEditorProps.pointIndex,
                newPosition,
              )
            }
          />
        )}
        {this.state.pointContextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({pointContextMenuProps: null}))}
            centerPoint={{
              left: this.state.pointContextMenuProps.left,
              top: this.state.pointContextMenuProps.top,
            }}
            placement="top"
            items={[
              {
                label: '$R$eset',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: '$D$elete',
                cb: () =>
                  this.removePoint(
                    this.state.pointContextMenuProps.variableId,
                    this.state.pointContextMenuProps.pointIndex,
                  ),
                IconComponent: MdCancel,
              },
              {
                label: '$C$onnect',
                cb: () =>
                  this.addConnector(
                    this.state.pointContextMenuProps.variableId,
                    this.state.pointContextMenuProps.pointIndex,
                  ),
                IconComponent: MdStars,
              },
            ]}
          />
        )}
        {this.state.connectorContextMenuProps != null && (
          <HalfPieContextMenu
            close={() =>
              this.setState(() => ({connectorContextMenuProps: null}))
            }
            centerPoint={{
              left: this.state.connectorContextMenuProps.left,
              top: this.state.connectorContextMenuProps.top,
            }}
            placement="top"
            items={[
              {
                label: '$R$eset',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: '$D$elete',
                cb: () =>
                  this.removeConnector(
                    this.state.connectorContextMenuProps.variableId,
                    this.state.connectorContextMenuProps.pointIndex,
                  ),
                IconComponent: MdCancel,
              },
              {
                label: '$S$elect',
                cb: () =>
                  this.removeConnector(
                    this.state.connectorContextMenuProps.variableId,
                    this.state.connectorContextMenuProps.pointIndex,
                  ),
                IconComponent: MdCamera,
              },
            ]}
          />
        )}
      </div>
    )
  }
}

export default connect()(BoxView)
