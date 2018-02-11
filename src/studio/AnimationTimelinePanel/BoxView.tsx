// @flow
import {React, connect, reduceStateAction, multiReduceStateAction} from '$studio/handy'
import {
  VariableID,
  VariableObject,
  Point,
  PointPosition,
  PointHandles,
  NormalizedPoint,
} from '$studio/animationTimeline/types'
import css from './BoxView.css'
import Variable from './Variable'
import BoxLegends from './BoxLegends'
import PointValuesEditor from './PointValuesEditor'
import * as _ from 'lodash'
import cx from 'classnames'
import {Subscriber} from 'react-broadcast'
import {
  PanelPropsChannel,
} from '$src/studio/workspace/components/Panel/Panel'
import {MODE_CMD, MODE_SHIFT} from '$studio/workspace/components/StudioUI/StudioUI'
import {SortableBoxDragChannel} from './SortableBox'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import MdCancel from 'react-icons/lib/md/cancel'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdStars from 'react-icons/lib/md/stars'
import MdCamera from 'react-icons/lib/md/camera'

type OwnProps = {
  variableIds: VariableID[]
  splitVariable: Function
  panelWidth: number
  duration: number
  // currentTime: number
  focus: [number, number]
  boxHeight: number
  tempIncludeTimeGrid?: boolean
  pathToTimeline: string[]
}

type Props = OwnProps & {
  variables: VariableObject[]
  dispatch: Function
  pathToVariables: string[]
}

type State = {
  svgWidth: number
  svgHeight: number
  svgTransform: number
  svgExtremums: [number, number]
  activeVariableId: string
  pointValuesEditorProps: undefined | null | Object
}
const resetExtremums = (pathToVariable: string[]) => {
  return reduceStateAction(pathToVariable, variable => {
    const {points} = variable
    if (points.length === 0) return variable
    // const newExtremums = points.reduce(
    //   (reducer, point, index) => {
    //     const {value} = point
    //     // const prevValue = points[index - 1] ? points[index - 1].value : 0
    //     // const nextValue = points[index + 1] ? points[index + 1].value : 0
    //     let candids = [0, 0]
    //     const nextPoint = points[index + 1]
    //     if (nextPoint != null) {
    //       candids = [
    //         value,
    //         value + point.interpolationDescriptor.handles[1] * (nextPoint.value - value),
    //         nextPoint.value + point.interpolationDescriptor.handles[3] * (value - nextPoint.value),
    //       ]
    //     } else {
    //       candids = [
    //         value,
    //       ]
    //     }
    //     return [
    //       Math.min(reducer[0], Math.min(...candids)) * .8,
    //       Math.max(reducer[1], Math.max(...candids)) * 1.2,
    //     ]
    //   },
    //   [0, 0],
    // )
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

const colors = [
  {name: 'blue', normal: '#3AAFA9', darkened: '#345b59'},
  {name: 'purple', normal: '#575790', darkened: '#323253'},
  {name: 'red', normal: '#B76C6C', darkened: '#4c3434'},
  {name: 'yellow', normal: '#FCE181', darkened: '#726a4b'},
]

class BoxBiew extends React.Component<Props, State> {
  svgArea: HTMLElement

  constructor(props: Props) {
    super(props)
    this.state = {
      ...this._getSvgState(props),
      pointValuesEditorProps: null,
      activeVariableId: props.variableIds[0],
    }
  }

  componentDidMount() {
    this.props.dispatch(
      resetExtremums([
        ...this.props.pathToVariables,
        this.state.activeVariableId,
      ]),
    )
  }

  componentWillReceiveProps(nextProps) {
    let activeVariableId = this.state.activeVariableId
    if (nextProps.variableIds.find(id => id === activeVariableId) == null) {
      activeVariableId = nextProps.variableIds[0]
    }
    if (
      this.state.activeVariableId !== activeVariableId ||
      nextProps.boxHeight !== this.props.boxHeight ||
      nextProps.duration !== this.props.duration ||
      nextProps.panelWidth !== this.props.panelWidth ||
      nextProps.focus[1] - nextProps.focus[0] !==
        this.props.focus[1] - this.props.focus[0] ||
      !_.isEqual(nextProps.variables, this.props.variables)  
    ) {
      this.setState(() => ({...this._getSvgState(nextProps), activeVariableId}))
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.boxHeight !== this.props.boxHeight) return true
    if (nextProps.canBeMerged !== this.props.canBeMerged) return true
    if (nextProps.shouldIndicateMerge !== this.props.shouldIndicateMerge)
      return true
    if (!_.isEqual(nextProps.variables, this.props.variables)) return true
    if (nextState.svgWidth !== this.state.svgWidth) return true
    if (nextState.svgExtremums !== this.state.svgExtremums) return true
    if (nextState.activeVariableId !== this.state.activeVariableId) return true
    if (nextState.pointValuesEditorProps !== this.state.pointValuesEditorProps)
      return true
    if (!_.isEqual(nextState.pointContextMenuProps, this.state.pointContextMenuProps))
      return true
    if (!_.isEqual(nextState.connectorContextMenuProps, this.state.connectorContextMenuProps))
      return true
    return false
  }

  titleClickHandler(e: React.MouseEvent<$FixMe>, variableId: string) {
    if (e.altKey) {
      return this.props.splitVariable(variableId)
    }
    this.setActiveVariable(variableId)
  }

  setActiveVariable = (activeVariableId: string) => {
    this.setState(() => ({activeVariableId}))
  }

  _getSvgState(props) {
    const {boxHeight, duration, focus, panelWidth, variables} = props
    const svgHeight = boxHeight - 30
    const svgWidth = Math.floor(duration / (focus[1] - focus[0]) * panelWidth)
    const svgTransform = svgWidth * focus[0] / duration

    // const svgExtremums = variables.reduce(
    //   (reducer, {extremums}) => {
    //     if (extremums[0] < reducer[0]) reducer[0] = extremums[0]
    //     if (extremums[1] > reducer[1]) reducer[1] = extremums[1]
    //     return reducer
    //   },
    //   [0, 0],
    let min, max
    variables.forEach((variable, index) => {
      const {extremums} = variable
      min = (min == null) ? extremums[0] : Math.min(min, extremums[0])
      max = (max == null) ? extremums[1] : Math.max(max, extremums[1])
    })
    const svgExtremums = [min, max]

    // )

    return {svgHeight, svgWidth, svgTransform, svgExtremums}
  }

  addPoint = (e: $FixMe, activeMode: string) => {
    if (activeMode !== MODE_CMD) return
    e.stopPropagation()

    const {top, left} = this.svgArea.getBoundingClientRect()
    const time = e.clientX - left + 5
    const value = e.clientY - top - 10
    const pointProps: Point = {
      time: this._deNormalizeX(time),
      value: this._deNormalizeValue(value),
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
    // this.props.dispatch(
    //   resetExtremums([
    //     ...this.props.pathToVariables,
    //     this.state.activeVariableId,
    //   ]),
    // )
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
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
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
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
    )
  }

  showPointValuesEditor(
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number; top: number},
  ) {
    this.setState(() => ({
      pointValuesEditorProps: {...pos, variableId, pointIndex},
    }))
  }

  showContextMenuForPoint(
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number, top: number},
  ) {
    this.setState(() => ({
      pointContextMenuProps: {...pos, variableId, pointIndex}
    }))
  }

  showContextMenuForConnector(
    variableId: VariableID,
    pointIndex: number,
    pos: {left: number, top: number},
  ) {
    this.setState(() => ({
      connectorContextMenuProps: {...pos, variableId, pointIndex}
    }))
  }

  changePointPositionBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointPosition,
  ) => {
    const deNormalizedChange = this.deNormalizePositionChange(change)
    this.props.dispatch(
      reduceStateAction(this.pathToPoint(variableId, pointIndex), point => ({
        ...point,
        time: point.time + deNormalizedChange.time,
        value: point.value + deNormalizedChange.value,
      })),
    )
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
    )
  }

  changePointHandlesBy = (
    variableId: VariableID,
    pointIndex: number,
    change: PointHandles,
  ) => {
    const {points} = this.props.variables.find(({id}) => id === variableId)
    const deNormalizedChange = this._deNormalizeHandles(
      change,
      points[pointIndex],
      points[pointIndex - 1],
      points[pointIndex + 1],
    )
    if (pointIndex === 0) {
      this.props.dispatch(
        reduceStateAction(
          [...this.pathToPoint(variableId, pointIndex), 'interpolationDescriptor', 'handles'],
          handles => {
            return (
              handles.slice(0, 2).map((handle, index) => handle + deNormalizedChange[index + 2])              
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
                handles.slice(0, 2).map((handle, index) => handle + deNormalizedChange[index + 2])              
              ).concat(handles.slice(2))
            }
          },
          {
            path: [...this.pathToPoint(variableId, pointIndex - 1), 'interpolationDescriptor', 'handles'],          
            reducer: handles => {
              return (
                handles.slice(0, 2).concat(
                  handles.slice(2).map((handle, index) => handle + deNormalizedChange[index])
                )
              )
            }
          },
        ])
      )
    }
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
    )
  }

  addConnector = (variableId: VariableID, pointIndex: number) => {
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
    this.props.dispatch(
      resetExtremums([...this.props.pathToVariables, variableId]),
    )
  }

  _normalizeX(x: number) {
    return x * this.state.svgWidth / this.props.duration
  }

  _deNormalizeX(x: number) {
    return x * this.props.duration / this.state.svgWidth
  }

  _normalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return -y * svgHeight / (svgExtremums[1] - svgExtremums[0])
  }

  _deNormalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return -y * (svgExtremums[1] - svgExtremums[0]) / svgHeight
  }

  _normalizeValue(value: number) {
    return this._normalizeY(value - this.state.svgExtremums[1])
  }

  _deNormalizeValue(value: number) {
    return this.state.svgExtremums[1] + this._deNormalizeY(value)
  }

  normalizePositionChange = (position: PointPosition): PointPosition => {
    return {
      time: this._normalizeX(position.time),
      value: this._normalizeY(position.value),
    }
  }

  deNormalizePositionChange = (position: PointPosition): PointPosition => {
    return {
      time: this._deNormalizeX(position.time),
      value: this._deNormalizeY(position.value),
    }
  }

  _normalizeHandles = (
    handles: PointHandles,
    point: Point,
    // prevPoint: undefined | null | Point,
    nextPoint: undefined | null | Point,
  ): PointHandles => {
    // const handlesInPixels = [
    //   ...(prevPoint != null
    //     ? [
    //         handles[0] * (point.time - prevPoint.time),
    //         handles[1] * (point.value - prevPoint.value),
    //       ]
    //     : handles.slice(0, 2)),
    //   ...(nextPoint != null
    //     ? [
    //         handles[2] * (nextPoint.time - point.time),
    //         handles[3] * (nextPoint.value - point.value),
    //       ]
    //     : handles.slice(2)),
    // ]
    const handlesInPixels = [
      ...(nextPoint != null
        ? [
            handles[0] * (nextPoint.time - point.time),
            handles[1] * (nextPoint.value - point.value),
            handles[2] * (nextPoint.time - point.time),
            handles[3] * (nextPoint.value - point.value),
          ]
        : handles)
    ]
    return [
      this._normalizeX(handlesInPixels[0]),
      this._normalizeY(handlesInPixels[1]),
      this._normalizeX(handlesInPixels[2]),
      this._normalizeY(handlesInPixels[3]),
    ]
  }

  _deNormalizeHandles = (
    handles: PointHandles,
    point: Point,
    prevPoint: undefined | null | Point,
    nextPoint: undefined | null | Point,
  ): PointHandles => {
    const deNormalizedHandles: PointHandles = [
      this._deNormalizeX(handles[0]),
      this._deNormalizeY(handles[1]),
      this._deNormalizeX(handles[2]),
      this._deNormalizeY(handles[3]),
    ]
    // return [
    //   ...(nextPoint != null
    //     ? [
    //         deNormalizedHandles[0] / (prevPoint.time - point.time),
    //         deNormalizedHandles[1] / (prevPoint.value - point.value),
    //         deNormalizedHandles[2] / (nextPoint.time - point.time),
    //         deNormalizedHandles[3] / (nextPoint.value - point.value),
    //       ]
    //     : handles)
    // ]

    return [
      ...(prevPoint != null
        ? [
            deNormalizedHandles[0] / (prevPoint.time - point.time),
            (prevPoint.value === point.value) ? 0 : deNormalizedHandles[1] / (prevPoint.value - point.value),
          ]
        : [deNormalizedHandles[0], deNormalizedHandles[1]]),
      ...(nextPoint != null
        ? [
            deNormalizedHandles[2] / (nextPoint.time - point.time),
            (nextPoint.value === point.value ) ? 0 : deNormalizedHandles[3] / (nextPoint.value - point.value),
          ]
        : [deNormalizedHandles[2], deNormalizedHandles[3]]),
    ]
  }

  _normalizePoints(points: Point[]): NormalizedPoint[] {
    return points.map((point, index) => {
      const {time, value, interpolationDescriptor} = point
      return {
        _t: time,
        _value: value,
        time: this._normalizeX(time),
        value: this._normalizeValue(value),
        interpolationDescriptor: {
          ...interpolationDescriptor,
          handles: this._normalizeHandles(
            interpolationDescriptor.handles,
            point,
            // points[index - 1],
            points[index + 1],
          ),
        },
      }
    })
  }

  render() {
    const {
      variables,
      shouldIndicateMerge,
      canBeMerged,
      tempIncludeTimeGrid,
    } = this.props
    const {
      svgHeight,
      svgWidth,
      svgTransform,
      activeVariableId,
      pointValuesEditorProps,
    } = this.state

    let variablesColors = {}
    variables.forEach((variable: $FixMe, index: number) => {
      variablesColors = {...variablesColors, [variable.id]: colors[index % colors.length]}
    })
    return (
      <Subscriber channel={PanelPropsChannel}>
      {({activeMode}) => {
        const isAddingPoint = activeMode === MODE_CMD
        return (
          <Subscriber channel={SortableBoxDragChannel}>
            {({onDragStart, onDrag, onDragEnd}) => {
              return (
                <div
                  ref={c => (this.container = c)}
                  className={cx(css.container, {
                    [css.canBeMerged]: canBeMerged,
                    [css.indicateMerge]: shouldIndicateMerge,
                    [css.redAddCursor]: isAddingPoint && variablesColors[activeVariableId].name === 'red',
                    [css.blueAddCursor]: isAddingPoint && variablesColors[activeVariableId].name === 'blue',
                    [css.yellowAddCursor]: isAddingPoint && variablesColors[activeVariableId].name === 'yellow',
                    [css.purpleAddCursor]: isAddingPoint && variablesColors[activeVariableId].name === 'purple',
                  })}
                  style={{width: svgWidth}}
                >
                  {tempIncludeTimeGrid && <div className={css.timeGrid} />}
                  <DraggableArea
                    // withShift={true}
                    shouldRegisterEvents={activeMode === MODE_SHIFT}
                    onDragStart={onDragStart}
                    onDrag={(_, dy) => onDrag(dy)}
                    onDragEnd={onDragEnd}
                  >
                    <div className={css.boxLegends}>
                      <BoxLegends
                        activeMode={activeMode}
                        variables={variables.map(variable =>
                          _.pick(variable, ['id', 'component', 'property']),
                        )}
                        colors={colors.map(c => c.normal)}
                        activeVariableId={activeVariableId}
                        setActiveVariable={this.setActiveVariable}
                        splitVariable={this.props.splitVariable}
                      />
                    </div>
                  </DraggableArea>
                  <div className={css.svgArea}>
                    <svg
                      viewBox={`0 -15 ${svgWidth} ${svgHeight + 30}`}
                      height={svgHeight + 30}
                      width={svgWidth}
                      // style={{transform: `translateX(${-svgTransform}px)`}}
                      ref={svg => {
                        if (svg != null) this.svgArea = svg
                      }}
                      onMouseDown={(e: $FixMe) => this.addPoint(e, activeMode)}
                    >
                      <defs>
                        <filter id="glow">
                          <feColorMatrix type="matrix" values={`3  0  0  0  0
                                                                0  3  0  0  0
                                                                0  0  3  0  0
                                                                0  0  0  1  0`} />
                          <feGaussianBlur stdDeviation=".7" />
                        </filter>
                      </defs>
                      {_.sortBy(variables, (variable: $FixMe) => (variable.id === activeVariableId)).map(({id, points}, index) => (
                        <Variable
                          key={id}
                          variableId={id}
                          points={this._normalizePoints(points)}
                          // color={colors[index % colors.length]}
                          color={variablesColors[id]}
                          width={svgWidth}
                          showPointValuesEditor={(index, pos) =>
                            this.showPointValuesEditor(id, index, pos)
                          }
                          showContextMenu={(index, pos) =>
                            this.showContextMenuForPoint(id, index, pos)
                          }
                          showContextMenuForConnector={(index, pos) =>
                            this.showContextMenuForConnector(id, index, pos)
                          }
                          changePointPositionBy={(index, change) =>
                            this.changePointPositionBy(id, index, change)
                          }
                          changePointHandlesBy={(index, change) =>
                            this.changePointHandlesBy(id, index, change)
                          }
                          setPointPositionTo={(index, newPosition) =>
                            this.setPointPositionTo(id, index, newPosition)
                          }
                          removePoint={index => this.removePoint(id, index)}
                          addConnector={index => this.addConnector(id, index)}
                          removeConnector={index => this.removeConnector(id, index)}
                          makeHandleHorizontal={(index, side) =>
                            this.makeHandleHorizontal(id, index, side)
                          }
                        />
                      ))}
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
            }}
          </Subscriber>
        )
      }}
      </Subscriber>
    )
  }
}

export default connect((s, op) => {  
  const pathToVariables = [...op.pathToTimeline, 'variables']
  const variablesState = _.get(s, pathToVariables)

  const variables = op.variableIds.map(id => variablesState[id])
  return {
    variables,
    pathToVariables,
  }
})(BoxBiew)
