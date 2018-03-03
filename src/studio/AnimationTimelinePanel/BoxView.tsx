// @flow
import {React, connect, reduceStateAction, multiReduceStateAction, StudioComponent} from '$studio/handy'
import {
  VariableID,
  VariableObject,
  Point,
  PointPosition,
  PointHandles,
  NormalizedPoint,
} from '$studio/animationTimelinePanel/types'
import css from './BoxView.css'
import Variables from './Variables'
import PointValuesEditor from './PointValuesEditor'
import * as _ from 'lodash'
import cx from 'classnames'
import {MODE_CMD} from '$studio/workspace/components/StudioUI/StudioUI'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import MdCancel from 'react-icons/lib/md/cancel'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdStars from 'react-icons/lib/md/stars'
import MdCamera from 'react-icons/lib/md/camera'

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
}

interface IProps extends IOwnProps {
  dispatch: Function
}

type IState = {
  svgExtremums: [number, number]
  pointValuesEditorProps: undefined | null | Object
  variableIdToColorIndexMap: {[variableId: string]: number}
  variablesShouldReRender: boolean
}
const resetExtremums = (pathToVariable: string[]) => {
  return reduceStateAction(pathToVariable, variable => {
    const {points} = variable
    if (points.length === 0) return variable

    let min, max
    points.forEach((point, index) => {
      const {value} = point
      const nextPoint = points[index + 1]
      let candids = [value]
      if (nextPoint != null) {
        candids = candids.concat(
          value + point.interpolationDescriptor.handles[1] * (nextPoint.value - value),
          nextPoint.value + point.interpolationDescriptor.handles[3] * (value - nextPoint.value))
      }
      const localMin = Math.min(...candids)
      const localMax = Math.max(...candids)
      min = (min == null) ? localMin : Math.min(min, localMin)
      max = (max == null) ? localMax : Math.max(max, localMax)
    })
    if (min === max) {
      min -= 5
      max += 5
    }

    return {
      ...variable,
      extremums: [min, max],
    }
  })
}

const svgPaddingY = 20
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
      svgExtremums: this._getSvgExtremums(props),
      pointValuesEditorProps: null,
      variableIdToColorIndexMap: this._getVariableIdToColorIndexMap(props.variables),
      variablesShouldReRender: false,
    }
  }

  componentDidMount() {
    this.props.dispatch(
      resetExtremums([
        ...this.props.pathToVariables,
        this.props.activeVariableId,
      ]),
    )
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.variableIds !== this.props.variableIds) {
      this.setVariablesShouldReRenderToTrue()
      this.setState(() => ({
        variableIdToColorIndexMap: this._getVariableIdToColorIndexMap(nextProps.variables)
      }))
    }

    const newSvgExtremums = this._getSvgExtremums(nextProps)
    if (
      !_.isEqual(newSvgExtremums, this.state.svgExtremums)
    ) {
      this.setVariablesShouldReRenderToTrue()
      this.setState(() => ({svgExtremums: newSvgExtremums}))
    }
  }

  _getVariableIdToColorIndexMap(variables: VariableObject[]): {[variableId: string]: number} {
    const colorsLength = colors.length
    return variables.reduce(
      (reducer, variable, index) => {
        return {
          ...reducer,
          [variable.id]: index % colorsLength,
        }
      }, {})
  }

  setVariablesShouldReRenderToFalse = () => {
    this.setState(() => ({variablesShouldReRender: false}))
  }

  setVariablesShouldReRenderToTrue = () => {
    this.setState(() => ({variablesShouldReRender: true}))
  }

  _getSvgExtremums(props: IProps) {
    const {variables} = props
    let min: undefined | null | number, max: undefined | null | number
    variables.forEach((variable: $FixMe) => {
      const {extremums} = variable
      min = (min == null) ? extremums[0] : Math.min(min, extremums[0])
      max = (max == null) ? extremums[1] : Math.max(max, extremums[1])
    })

    return [min, max]
  }

  _resetExtremumsOfVariable(variableId: string) {
    this.setVariablesShouldReRenderToTrue()
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
    )
  }

  addPoint = (e: $FixMe, activeMode: string) => {
    if (activeMode !== MODE_CMD) return
    e.stopPropagation()

    const {svgHeight, svgWidth, duration} = this.props
    const {svgExtremums} = this.state
    const {top, left} = this.svgArea.getBoundingClientRect()
    const time = e.clientX - left + 5
    const value = e.clientY - top + 5 - .5 * svgPaddingY
    const pointProps: Point = {
      time: time * duration / svgWidth,
      value: -value * (svgExtremums[1] - svgExtremums[0]) / (svgHeight - svgPaddingY),
      interpolationDescriptor: {
        connected: false,
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        interpolationType: 'CubicBezier',
        handles: [.5, 0, .5, 0],
      }
    }
    this.props.dispatch(
      reduceStateAction(
        [...this.props.pathToVariables, this.state.activeVariableId],
        variable => {
          const points = variable.points
          let atIndex = points.findIndex(point => point.time > pointProps.time)
          if (atIndex === -1) atIndex = points.length
          return {
            ...variable,
            points: points
              .slice(0, atIndex)
              .concat(pointProps, points.slice(atIndex)),
          }
        },
      ),
    )
    this._resetExtremumsOfVariable(this.props.activeVariableId)
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
      reduceStateAction(this.pathToPoints(variableId), points =>
        points.slice(0, pointIndex).concat(points.slice(pointIndex + 1)),
      ),
    )
    this._resetExtremumsOfVariable(variableId)
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

    this._resetExtremumsOfVariable(variableId)
  }

  changePointPositionBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointPosition,
  ) => {
    const {svgExtremums} = this.state
    const extDiff = svgExtremums[1] - svgExtremums[0]
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        time: point.time + change.time * this.props.duration / 100,
        value: point.value + svgExtremums[1] - change.value * extDiff / 100
      })),
    )

    this._resetExtremumsOfVariable(variableId)
  }

  changePointHandlesBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointHandles,
  ) => {
    if (pointIndex === 0) {
      this.props.dispatch(
        reduceStateAction(
          [...this.pathToPoint(variableId, pointIndex), 'interpolationDescriptor', 'handles'],
          handles => {
            return (
              handles.slice(0, 2).map((handle, index) => handle + change[index + 2])
            ).concat(handles.slice(2))
          }
        )
      )
    } else {
      this.props.dispatch(
        multiReduceStateAction([
          {
            path: [...this.pathToPoint(variableId, pointIndex), 'interpolationDescriptor', 'handles'],
            reducer: handles => {
              return (
                handles.slice(0, 2).map((handle, index) => handle + change[index + 2])
              ).concat(handles.slice(2))
            }
          },
          {
            path: [...this.pathToPoint(variableId, pointIndex - 1), 'interpolationDescriptor', 'handles'],
            reducer: handles => {
              return (
                handles.slice(0, 2).concat(
                  handles.slice(2).map((handle, index) => handle + change[index])
                )
              )
            }
          },
        ])
      )
    }

    this._resetExtremumsOfVariable(variableId)
  }

  addConnector = (variableId: VariableID, pointIndex: number) => {
    this._resetExtremumsOfVariable(variableId)
    this.props.dispatch(
      reduceStateAction(
        this.pathToPoint(variableId, pointIndex),
        point => ({
          ...point,
          interpolationDescriptor: {
            ...point.interpolationDescriptor,
            connected: true,
          }
        }),
      ),
    )
  }

  removeConnector = (variableId: VariableID, pointIndex: number) => {
    this._resetExtremumsOfVariable(variableId)
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        interpolationDescriptor: {
          ...point.interpolationDescriptor,
          connected: false,
        }
      })),
    )
  }

  makeHandleHorizontal = (
    variableId: VariableID,
    pointIndex: number,
    side: 'left' | 'right',
  ) => {
    this._resetExtremumsOfVariable(variableId)
    if (side === 'left' && pointIndex !== 0) {
      this.props.dispatch(
        reduceStateAction(
          [...this.pathToPoint(variableId, pointIndex - 1), 'interpolationDescriptor', 'handles'],
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
          [...this.pathToPoint(variableId, pointIndex), 'interpolationDescriptor', 'handles'],
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
    pos: {left: number, top: number},
  ) => {
    this.setState(() => ({
      pointContextMenuProps: {...pos, variableId, pointIndex}
    }))
  }

  showContextMenuForConnector = (
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number, top: number},
  ) => {
    this.setState(() => ({
      connectorContextMenuProps: {...pos, variableId, pointIndex}
    }))
  }

  _normalizePoints(points: Point[]): NormalizedPoint[] {
    const {svgExtremums} = this.state
    const extDiff = svgExtremums[1] - svgExtremums[0]
    return points.map((point: $FixMe) => {
      const {time, value, interpolationDescriptor} = point
      return {
        _t: time,
        _value: value,
        time: time / this.props.duration * 100,
        value: (svgExtremums[1] - value) / extDiff * 100,
        interpolationDescriptor: {...interpolationDescriptor},
      }
    })
  }

  getSvgSize = () => {
    return {width: this.props.svgWidth, height: this.props.svgHeight - svgPaddingY}
  }

  getNormalizedVariables = () => {
    return this.props.variables.map((variable: $FixMe) => (
      {
        ...variable,
        points: this._normalizePoints(variable.points),
      }
    ))
  }

  render() {
    const {
      svgHeight,
      svgWidth,
      activeVariableId,
      activeMode,
    } = this.props
    const {
      pointValuesEditorProps,
      variableIdToColorIndexMap,
    } = this.state

    const activeVariableColorName = colors[variableIdToColorIndexMap[activeVariableId]].name
    const isAddingPoint = activeMode === MODE_CMD
    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.container, {
          [css.redAddCursor]: isAddingPoint && activeVariableColorName === 'red',
          [css.blueAddCursor]: isAddingPoint && activeVariableColorName === 'blue',
          [css.yellowAddCursor]: isAddingPoint && activeVariableColorName === 'yellow',
          [css.purpleAddCursor]: isAddingPoint && activeVariableColorName === 'purple',
        })}
        style={{width: svgWidth}}
      >
        <div
          className={css.svgArea}
          style={{transform: `translate3d(${this.props.scrollLeft}px, 0, 0)`}}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            height={svgHeight}
            width={svgWidth}
            ref={svg => {
              if (svg != null) this.svgArea = svg
            }}
            onMouseDown={(e: $FixMe) => this.addPoint(e, activeMode)}
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight - svgPaddingY}`}
              x={0}
              y={svgPaddingY / 2}
              width={svgWidth}
              height={svgHeight - svgPaddingY}
              style={{overflow: 'visible'}}>
              <defs>
                <filter id="glow">
                  <feColorMatrix type="matrix" values={`3  0  0  0  0
                                                        0  3  0  0  0
                                                        0  0  3  0  0
                                                        0  0  0  1  0`} />
                  <feGaussianBlur stdDeviation=".7" />
                </filter>
              </defs>
              <Variables
                shouldReRenderVariables={this.state.variablesShouldReRender}
                resetReRenderVariablesFlag={this.setVariablesShouldReRenderToFalse}
                activeVariableId={activeVariableId}
                getVariables={this.getNormalizedVariables}
                variableIdToColorIndexMap={variableIdToColorIndexMap}
                getSvgSize={this.getSvgSize}
                showPointValuesEditor={this.showPointValuesEditor}
                showContextMenuForPoint={this.showContextMenuForPoint}
                showContextMenuForConnector={this.showContextMenuForConnector}
                changePointPositionBy={this.changePointPositionBy}
                changePointHandlesBy={this.changePointHandlesBy}
                removePoint={this.removePoint}
                addConnector={this.addConnector}
                removeConnector={this.removeConnector}
                makeHandleHorizontal={this.makeHandleHorizontal}
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
            centerPoint={{left: this.state.pointContextMenuProps.left, top: this.state.pointContextMenuProps.top}}
            placement="top"
            items={[
              {
                label: '$R$eset',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: '$D$elete',
                cb: () => this.removePoint(this.state.pointContextMenuProps.variableId, this.state.pointContextMenuProps.pointIndex),
                IconComponent: MdCancel,
              },
              {
                label: '$C$onnect',
                cb: () => this.addConnector(this.state.pointContextMenuProps.variableId, this.state.pointContextMenuProps.pointIndex),
                IconComponent: MdStars,
              },
            ]}
          />
        )}
        {this.state.connectorContextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({connectorContextMenuProps: null}))}
            centerPoint={{left: this.state.connectorContextMenuProps.left, top: this.state.connectorContextMenuProps.top}}
            placement="top"
            items={[
              {
                label: '$R$eset',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
              {
                label: '$D$elete',
                cb: () => this.removeConnector(this.state.connectorContextMenuProps.variableId, this.state.connectorContextMenuProps.pointIndex),
                IconComponent: MdCancel,
              },
              {
                label: '$S$elect',
                cb: () => this.removeConnector(this.state.connectorContextMenuProps.variableId, this.state.connectorContextMenuProps.pointIndex),
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
