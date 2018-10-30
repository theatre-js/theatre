import React from 'react'
import {PointHandles as IHandles} from '$theater/AnimationTimelinePanel/types'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {
  MODES,
  ActiveMode,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import css from './BezierConnector.css'
import noop from '$shared/utils/noop'
import {TShowConnectorContextMenu} from '$theater/AnimationTimelinePanel/views/types'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  leftPointIndex?: number
  leftPointTime: number
  leftPointValue: number
  rightPointTime: number
  rightPointValue: number
  handles: IHandles
  removeConnector?: (pointIndex: number) => void
  showContextMenu?: TShowConnectorContextMenu
}

interface IState {}

class BezierConnector extends React.PureComponent<IProps, IState> {
  connectorClickArea: SVGPathElement | null
  activeMode: ActiveMode

  static defaultProps = {
    removeConnector: noop,
    showContextMenu: noop,
  }

  render() {
    const {
      leftPointTime,
      leftPointValue,
      rightPointTime,
      rightPointValue,
      handles,
    } = this.props

    const valueAbsDiff = Math.abs(rightPointValue - leftPointValue)
    const x = `${leftPointTime}%`
    const y = `${Math.min(leftPointValue, rightPointValue)}%`
    const width = `${Math.abs(rightPointTime - leftPointTime)}%`
    const height = valueAbsDiff === 0 ? '100%' : `${valueAbsDiff}%`

    let pathD
    if (rightPointValue > leftPointValue) {
      pathD = `M 0 0
               C ${handles[0] * 100}
                 ${handles[1] * 100}
                 ${100 - handles[2] * 100}
                 ${100 - handles[3] * 100} 100 100`
    }
    if (rightPointValue < leftPointValue) {
      pathD = `M 0 100
               C ${handles[0] * 100}
                 ${100 - handles[1] * 100}
                 ${100 - handles[2] * 100}
                 ${handles[3] * 100} 100 0`
    }
    if (rightPointValue === leftPointValue) {
      pathD = `M 0 0
               C ${handles[0] * 100} 0
                 ${handles[2] * 100} 0 100 0`
    }

    return (
      <>
        <Subscriber channel={PanelActiveModeChannel}>
          {this._setActiveMode}
        </Subscriber>
        <svg
          x={x}
          y={y}
          width={width}
          height={height}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          {...classes('curveContainer')}
        >
          <path
            d={pathD}
            fill="transparent"
            stroke="transparent"
            strokeWidth={10}
            vectorEffect="non-scaling-stroke"
            onMouseDown={this.clickHandler}
            onContextMenu={this.contextMenuHandler}
            ref={c => (this.connectorClickArea = c)}
          />
          <path
            d={pathD}
            fill="transparent"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            {...classes('connectorPath')}
          />
        </svg>
      </>
    )
  }

  private _setActiveMode = (activeMode: ActiveMode) => {
    this.activeMode = activeMode
    if (this.connectorClickArea == null) return null
    if (activeMode === MODES.d) {
      this.connectorClickArea.classList.add('connector-highlightRedOnHover')
    } else {
      this.connectorClickArea.classList.remove('connector-highlightRedOnHover')
    }
    return null
  }

  clickHandler = (e: React.MouseEvent<SVGPathElement>) => {
    if (this.activeMode === MODES.d) {
      e.stopPropagation()
      this.props.removeConnector!(this.props.leftPointIndex as number)
    }
  }

  contextMenuHandler = (e: React.MouseEvent<SVGPathElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.props.showContextMenu!({
      left: clientX,
      top: clientY,
      pointIndex: this.props.leftPointIndex as number,
    })
  }
}

export default BezierConnector
