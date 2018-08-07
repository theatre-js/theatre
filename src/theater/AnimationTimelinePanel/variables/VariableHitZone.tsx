import React from 'react'
import {svgPaddingY} from '$theater/AnimationTimelinePanel/variables/GraphsSvgWrapper'
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
import css from './VariableHitZone.css'
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
  dopeSheet: boolean
}

interface IState {}

const style = {
  '--svgPadding': svgPaddingY,
}

class VariableHitZone extends PureComponentWithTheater<IProps, IState> {
  render() {
    const {color, dopeSheet} = this.props
    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {(activeMode: ActiveMode) => {
          return (
            <rect
              {...classes(
                'container',
                dopeSheet && 'fullHeight',
                `${color.name.toLowerCase()}Cursor`,
                activeMode === MODES.cmd && 'enabled',
              )}
              fill="transparent"
              width="100%"
              y={dopeSheet ? 0 : -svgPaddingY / 2}
              style={style}
              onMouseDown={stopPropagation}
              onClick={this.addPoint}
            />
          )
        }}
      </Subscriber>
    )
  }

  addPoint = (evt: React.MouseEvent<SVGRectElement>) => {
    this._dispatchAddPoint(this._getPointProps(evt))
  }

  _getPointProps(evt: React.MouseEvent<SVGRectElement>): TPoint {
    const {duration, extremums, dopeSheet} = this.props

    const {clientX, clientY, target} = evt
    const {
      left,
      top,
      width,
      height,
    } = (target as SVGRectElement).getBoundingClientRect()

    const time = ((clientX - left + 5) * duration) / width
    let value
    if (dopeSheet) {
      value = 0.5 * (extremums[1] + extremums[0])
    } else {
      value =
        extremums[1] -
        ((clientY - top + 5 - 0.5 * svgPaddingY) *
          (extremums[1] - extremums[0])) /
          (height - svgPaddingY)
    }

    return {
      time,
      value,
      interpolationDescriptor: {
        connected: false,
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        interpolationType: 'CubicBezier',
        handles: [0.5, 0, 0.5, 0],
      },
    }
  }

  _dispatchAddPoint(pointProps: TPoint) {
    const {pathToTimeline, variableId} = this.props
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
}

export default VariableHitZone
