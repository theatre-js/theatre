import React from 'react'
import {PointHandles as IHandles} from '$theater/AnimationTimelinePanel/types'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODE_D} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import * as css from './Connector.css'

interface IProps {
  leftPointIndex?: number
  leftPointTime: number
  leftPointValue: number
  rightPointTime: number
  rightPointValue: number
  handles: IHandles
  removeConnector?: Function
  showContextMenu?: Function
}

interface IState {}

class Connector extends React.PureComponent<IProps, IState> {
  connectorClickArea: SVGPathElement | null
  activeMode: string

  clickHandler = (e: $FixMe) => {
    if (this.activeMode === MODE_D) {
      e.stopPropagation()
      return (
        this.props.removeConnector &&
        this.props.removeConnector(this.props.leftPointIndex)
      )
    }
  }

  contextMenuHandler = (e: $FixMe) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    const pos = {left: clientX, top: clientY}
    this.props.showContextMenu &&
      this.props.showContextMenu(this.props.leftPointIndex, pos)
  }

  _setActiveMode(activeMode: string) {
    this.activeMode = activeMode
    if (this.connectorClickArea == null) return
    if (activeMode === MODE_D) {
      this.connectorClickArea.classList.add('connector-highlightRedOnHover')
    } else {
      this.connectorClickArea.classList.remove('connector-highlightRedOnHover')
    }
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

    return [
      <Subscriber key="subscriber" channel={PanelActiveModeChannel}>
        {({activeMode}: {activeMode: string}) => {
          this._setActiveMode(activeMode)
          return null
        }}
      </Subscriber>,
      <svg
        key="curve"
        x={x}
        y={y}
        width={width}
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={css.curveContainer}
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
          className={css.connectorPath}
        />
      </svg>,
    ]
  }
}

export default Connector
