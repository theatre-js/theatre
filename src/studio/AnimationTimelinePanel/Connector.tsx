// @flow
import React from 'react'
import {NormalizedPoint} from '$studio/animationTimeline/types'
import {
  PanelPropsChannel,
} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODE_D} from '$studio/workspace/components/TheUI'
import cx from 'classnames'
import css from './Connector.css'

type Props = {
  leftPoint: NormalizedPoint
  rightPoint: NormalizedPoint
  removeConnector?: Function
}

type State = {}

class Connector extends React.PureComponent<Props, State> {
  clickHandler = (e: $FixMe, activeMode: string) => {
    e.stopPropagation()
    if (activeMode === MODE_D) {
      return this.props.removeConnector && this.props.removeConnector()
    }
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.props.showContextMenu({
      left: clientX,
      top: clientY,
    })
  }

  render() {
    const {leftPoint: lp, rightPoint: rp} = this.props
    return (
      <Subscriber channel={PanelPropsChannel}>
        {({activeMode}) => {
          return (
            <g>
              <path
                d={`M ${lp.time} ${lp.value}
                    C ${lp.time + lp.interpolationDescriptor.handles[0]} ${lp.value +
                  lp.interpolationDescriptor.handles[1]}
                      ${rp.time - lp.interpolationDescriptor.handles[2]} ${rp.value -
                  lp.interpolationDescriptor.handles[3]}
                      ${rp.time} ${rp.value}`}
                fill="transparent"
                stroke="transparent"
                strokeWidth={10}
                onMouseDown={(e) => this.clickHandler(e, activeMode)}
                onContextMenu={this.contextMenuHandler}
                className={cx({[css.highlightRedOnHover]: activeMode === MODE_D})}                
              />
              <path
                d={`M ${lp.time} ${lp.value}
                    C ${lp.time + lp.interpolationDescriptor.handles[0]} ${lp.value +
                  lp.interpolationDescriptor.handles[1]}
                      ${rp.time - lp.interpolationDescriptor.handles[2]} ${rp.value -
                  lp.interpolationDescriptor.handles[3]}
                      ${rp.time} ${rp.value}`}
                fill="transparent"
                strokeWidth={2}
                className={css.connectorPath}
              />
            </g>
          )
        }}
      </Subscriber>
    )
  }
}

export default Connector
