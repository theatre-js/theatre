import React from 'react'
import css from './BezierConnector.css'
import noop from '$shared/utils/noop'
import resolveCss from '$shared/utils/resolveCss'
import {IPointHandles} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {
  IActiveMode,
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'

const classes = resolveCss(css)

interface IProps {
  leftPointIndex?: number
  leftPointTime: number
  leftPointValue: number
  rightPointTime: number
  rightPointValue: number
  handles: IPointHandles
  removeConnector?: (pointIndex: number) => void
  showContextMenu?: $FixMe
}

interface IState {}

class BezierConnector extends React.PureComponent<IProps, IState> {
  connectorClickArea: SVGPathElement | null
  activeMode: IActiveMode

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
        <ActiveModeContext.Consumer>
          {this._setActiveMode}
        </ActiveModeContext.Consumer>
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
            onMouseDown={this.handleClick}
            onContextMenu={this.handleContextMenu}
            ref={c => (this.connectorClickArea = c)}
          />
          <path
            d={pathD}
            fill="transparent"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            {...classes('connectorPath')}
          />
        </svg>
      </>
    )
  }

  private _setActiveMode = (activeMode: IActiveMode) => {
    this.activeMode = activeMode
    if (this.connectorClickArea == null) return null
    if (activeMode === MODES.d) {
      this.connectorClickArea.classList.add(css.highlightRedOnHover)
    } else {
      this.connectorClickArea.classList.remove(css.highlightRedOnHover)
    }
    return null
  }

  handleClick = (event: React.MouseEvent<SVGPathElement>) => {
    if (this.activeMode === MODES.d) {
      event.stopPropagation()
      this.props.removeConnector!(this.props.leftPointIndex as number)
    }
  }

  handleContextMenu = (event: React.MouseEvent<SVGPathElement>) => {
    event.stopPropagation()
    event.preventDefault()
    const {clientX, clientY} = event
    this.props.showContextMenu!({
      left: clientX,
      top: clientY,
      pointIndex: this.props.leftPointIndex as number,
    })
  }
}

export default BezierConnector
