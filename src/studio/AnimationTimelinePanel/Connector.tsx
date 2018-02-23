// @flow
import React from 'react'
import {NormalizedPoint} from '$studio/animationTimeline/types'
import {
  PanelActiveModeChannel,
} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODE_D} from '$studio/workspace/components/StudioUI/StudioUI'
import cx from 'classnames'
import css from './Connector.css'

type Props = {
  pointIndex: number
  leftPoint: NormalizedPoint
  rightPoint: NormalizedPoint
  removeConnector?: Function
  showContextMenu: Function
}

type State = {}

class Connector extends React.PureComponent<Props, State> {
  clickHandler = (e: $FixMe, activeMode: string) => {
    e.stopPropagation()
    if (activeMode === MODE_D) {
      return this.props.removeConnector && this.props.removeConnector(this.props.pointIndex)
    }
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    const pos = {left: clientX, top: clientY}
    this.props.showContextMenu(this.props.pointIndex, pos)
  }

  render() {
    const {leftPoint: lp, rightPoint: rp} = this.props
    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {({activeMode}) => {
          const valueAbsDiff = Math.abs(rp.value - lp.value)
          const x = `${lp.time}%`
          const y = `${Math.min(rp.value, lp.value)}%`
          const width = `${Math.abs(rp.time - lp.time)}%`
          const height = valueAbsDiff === 0 ? '100%' : `${valueAbsDiff}%`

          let pathD
          if (rp.value > lp.value) {
            pathD = `M 0 0
                     C ${lp.interpolationDescriptor.handles[0] * 100}
                       ${lp.interpolationDescriptor.handles[1] * 100}
                       ${100 - lp.interpolationDescriptor.handles[2] * 100}
                       ${100 - lp.interpolationDescriptor.handles[3] * 100} 100 100`
          }
          if (rp.value < lp.value) {
            pathD = `M 0 100
                     C ${lp.interpolationDescriptor.handles[0] * 100}
                       ${100 - lp.interpolationDescriptor.handles[1] * 100}
                       ${100 - lp.interpolationDescriptor.handles[2] * 100}
                       ${lp.interpolationDescriptor.handles[3] * 100} 100 0`
          }
          if (rp.value === lp.value) {
            pathD = `M 0 0
                     C ${lp.interpolationDescriptor.handles[0] * 100} 0
                       ${lp.interpolationDescriptor.handles[2] * 100} 0 100 0`
          }

          return (
            <svg
              x={x}
              y={y}
              width={width}
              height={height}
              viewBox='0 0 100 100'
              preserveAspectRatio='none'
              className={css.curveContainer}>
              <path
                d={pathD}
                fill='transparent'
                stroke='transparent'
                strokeWidth={10}
                vectorEffect='non-scaling-stroke'
                onMouseDown={(e) => this.clickHandler(e, activeMode)}
                onContextMenu={this.contextMenuHandler}
                className={cx({[css.highlightRedOnHover]: activeMode === MODE_D})}/>
              <path
                d={pathD}
                fill='transparent'
                strokeWidth={2}
                vectorEffect='non-scaling-stroke'
                className={css.connectorPath}/>
            </svg>
          )
        }}
      </Subscriber>
    )
  }
}

export default Connector
