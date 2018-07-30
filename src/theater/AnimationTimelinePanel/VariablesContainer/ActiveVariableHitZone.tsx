import React from 'react'
import {svgPaddingY} from '$theater/AnimationTimelinePanel/VariablesContainer/VariablesSvgWrapper'
import {
  TColor,
  VariableID,
  TPoint,
  VariableObject,
} from '$theater/AnimationTimelinePanel/types'
import {Subscriber} from 'react-broadcast'
import {
  ActiveMode,
  MODES,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {stopPropagation} from '$theater/AnimationTimelinePanel/utils'
import css from './ActiveVariableHitZone.css'
import {resolveCss} from '$shared/utils'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

const classes = resolveCss(css)

interface IProps {
  color: TColor
  variableId: VariableID
  extremums: [number, number]
  duration: number
  pathToTimeline: string[]
}

interface IState {}

const style = {
  '--svgPadding': svgPaddingY,
}

class ActiveVariableHitZone extends PureComponentWithTheater<IProps, IState> {
  addPoint = (evt: React.MouseEvent<SVGRectElement>) => {
    const {duration, pathToTimeline, variableId, extremums} = this.props
    const {clientX, clientY, target} = evt
    const {
      left,
      top,
      width,
      height,
    } = (target as SVGRectElement).getBoundingClientRect()
    const time = clientX - left + 5
    const value = clientY - top + 5 - 0.5 * svgPaddingY
    const pointProps: TPoint = {
      time: (time * duration) / width,
      value:
        extremums[1] -
        (value * (extremums[1] - extremums[0])) / (height - svgPaddingY),
      interpolationDescriptor: {
        connected: false,
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        interpolationType: 'CubicBezier',
        handles: [0.5, 0, 0.5, 0],
      },
    }
    this.dispatch(
      reduceStateAction(
        pathToTimeline.concat('variables', variableId),
        (variable: VariableObject): VariableObject => {
          const points = variable.points
          let atIndex = points.findIndex(
            (point: TPoint) => point.time > pointProps.time,
          )
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
  }

  render() {
    const {color} = this.props
    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {(activeMode: ActiveMode) => {
          return (
            <rect
              {...classes(
                'container',
                `${color.name.toLowerCase()}Cursor`,
                activeMode === MODES.cmd && 'enabled',
              )}
              fill="transparent"
              width="100%"
              y={-svgPaddingY / 2}
              style={style}
              onMouseDown={stopPropagation}
              onClick={this.addPoint}
            />
          )
        }}
      </Subscriber>
    )
  }
}

export default ActiveVariableHitZone
