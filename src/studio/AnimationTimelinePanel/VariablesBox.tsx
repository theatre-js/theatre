import {React, connect} from '$studio/handy'
import css from './VariablesBox.css'
import DraggableArea from '$src/studio/common/components/DraggableArea/DraggableArea'
import {Subscriber} from 'react-broadcast'
import {PanelActiveModeChannel} from '$src/studio/workspace/components/Panel/Panel'
import {MODE_SHIFT} from '$src/studio/workspace/components/StudioUI/StudioUI'
import BoxLegends from '$src/studio/AnimationTimelinePanel/BoxLegends'
import {IStoreState} from '$src/studio/types'
import {
  VariableObject,
  VariableID,
} from '$src/studio/AnimationTimelinePanel/types'
import * as _ from 'lodash'
import BoxView, {colors} from '$src/studio/AnimationTimelinePanel/BoxView'
import cx from 'classnames'

interface IOwnProps {
  boxIndex: number
  boxId: string
  translateY: number
  svgHeight: number
  svgWidth: number
  variableIds: VariableID[]
  splitVariable: Function
  duration: number
  canBeMerged: boolean
  shouldIndicateMerge: boolean
  pathToTimeline: string[]
  scrollLeft: number
  isABoxBeingDragged: boolean
  isABoxBeingResized: boolean
  onMoveStart: Function
  onMoveEnd: Function
  onMove: Function
  onResizeStart: Function
  onResize: Function
  onResizeEnd: Function
}

interface IProps extends IOwnProps {
  variables: VariableObject[]
  pathToVariables: string[]
  dispatch: Function
}

interface IState {
  activeVariableId: VariableID
  isMoving: boolean
  moveY: number
}

class VariablesBox extends React.PureComponent<IProps, IState> {
  tempResizeY: number
  resizeEndTimeout: $FixMe

  constructor(props: IProps) {
    super(props)

    this.state = {
      activeVariableId: props.variableIds[0],
      isMoving: false,
      moveY: 0,
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    const {activeVariableId} = this.state
    if (nextProps.variableIds.find(id => id === activeVariableId) == null) {
      this.setState(() => ({activeVariableId: nextProps.variableIds[0]}))
    }
  }

  onMoveStart = (e: $FixMe) => {
    e.stopPropagation()
    this.setState(() => ({isMoving: true}))
    this.props.onMoveStart(this.props.boxIndex)
  }

  onMove = (_: number, dy: number) => {
    this.setState(() => ({moveY: dy}))
    this.props.onMove(dy)
  }

  onMoveEnd = () => {
    this.setState(() => ({
      isMoving: false,
      moveY: 0,
    }))
    this.props.onMoveEnd()
  }

  onResizeStart = () => {
    this.props.onResizeStart(this.props.boxId)
  }

  onResize = (_: number, dy: number) => {
    return this.props.onResize(dy)
  }

  setActiveVariable = (activeVariableId: string) => {
    this.setState(() => ({activeVariableId}))
  }

  _handleResizeOnPinch = (e: $FixMe) => {
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        if (this.props.isABoxBeingResized) {
          const {deltaY} = e
          clearTimeout(this.resizeEndTimeout)
          this.tempResizeY -= 3 * deltaY
          this.onResize(0, this.tempResizeY)
          this.resizeEndTimeout = setTimeout(this.props.onResizeEnd, 100)
        } else {
          this.tempResizeY = 0
          this.onResizeStart()
        }
      }
  }

  render() {
    const {props, state} = this
    const {
      variables,
      boxIndex,
      splitVariable,
      translateY,
      svgHeight,
      canBeMerged,
      shouldIndicateMerge,
      isABoxBeingDragged,
    } = props
    const {activeVariableId, moveY, isMoving} = state

    const containerStyle = {
      height: svgHeight,
      ...(!isMoving && translateY !== 0
        ? {transform: `translateY(${translateY}px)`}
        : {}),
    }
    const wrapperStyle = {
      '--height': svgHeight,
      ...(isMoving ? {transform: `translateY(${moveY}px)`} : {}),
    }
    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {({activeMode}) => {
          return (
            <div
              className={cx(css.container, {
                [css.canBeMerged]: canBeMerged,
                [css.indicateMerge]: shouldIndicateMerge,
                [css.isMoving]: isMoving,
                [css.isABoxBeingDragged]: isABoxBeingDragged,
              })}
              style={containerStyle}
            >
              <div className={css.wrapper} style={wrapperStyle}>
                <DraggableArea
                  shouldRegisterEvents={activeMode === MODE_SHIFT}
                  onDragStart={this.onMoveStart}
                  onDrag={this.onMove}
                  onDragEnd={this.onMoveEnd}
                >
                  <div className={cx(css.boxLegends, {[css.isMoving]: isMoving})}>
                    <BoxLegends
                      activeMode={activeMode}
                      variables={variables.map(variable =>
                        _.pick(variable, ['id', 'component', 'property']),
                      )}
                      colors={colors.map(c => c.normal)}
                      activeVariableId={activeVariableId}
                      setActiveVariable={this.setActiveVariable}
                      splitVariable={splitVariable}
                      boxIndex={boxIndex}
                    />
                  </div>
                </DraggableArea>
                <div
                  className={css.boxView}
                  onWheel={this._handleResizeOnPinch}
                >
                  <BoxView
                    variables={variables}
                    variableIds={props.variableIds}
                    activeVariableId={activeVariableId}
                    svgHeight={svgHeight}
                    svgWidth={props.svgWidth}
                    duration={props.duration}
                    activeMode={activeMode}
                    pathToVariables={props.pathToVariables}
                    scrollLeft={this.props.scrollLeft}
                  />
                </div>
                <DraggableArea
                  onDragStart={this.onResizeStart}
                  onDrag={this.onResize}
                  onDragEnd={props.onResizeEnd}
                >
                  <div className={css.resizeHandle} />
                </DraggableArea>
              </div>
            </div>
          )
        }}
      </Subscriber>
    )
  }
}

export default connect((s: IStoreState, op: IOwnProps) => {
  const pathToVariables = [...op.pathToTimeline, 'variables']
  const variablesState = _.get(s, pathToVariables)

  const variables = op.variableIds.map(id => variablesState[id])
  return {
    variables,
    pathToVariables,
  }
})(VariablesBox)
